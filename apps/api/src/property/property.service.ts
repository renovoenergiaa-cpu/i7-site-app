import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    city?: string;
    neighborhood?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    parkingSpots?: number;
    furnished?: boolean;
    petFriendly?: boolean;
    searchQuery?: string;
  }) {
    const where: any = {
      status: 'PUBLISHED',
    };

    if (query.city) {
      where.city = { contains: query.city };
    }
    if (query.neighborhood) {
      where.neighborhood = { contains: query.neighborhood };
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.minPrice || query.maxPrice) {
      where.rentPrice = {};
      if (query.minPrice) where.rentPrice.gte = Number(query.minPrice);
      if (query.maxPrice) where.rentPrice.lte = Number(query.maxPrice);
    }
    if (query.bedrooms) {
      where.bedrooms = { gte: Number(query.bedrooms) };
    }
    if (query.bathrooms) {
      where.bathrooms = { gte: Number(query.bathrooms) };
    }
    if (query.parkingSpots) {
      where.parkingSpots = { gte: Number(query.parkingSpots) };
    }
    if (query.furnished !== undefined) {
      where.furnished = query.furnished === true || String(query.furnished) === 'true';
    }
    if (query.petFriendly !== undefined) {
      where.petFriendly = query.petFriendly === true || String(query.petFriendly) === 'true';
    }

    if (query.searchQuery) {
      where.OR = [
        { title: { contains: query.searchQuery } },
        { description: { contains: query.searchQuery } },
        { neighborhood: { contains: query.searchQuery } },
        { city: { contains: query.searchQuery } },
      ];
    }

    try {
      const properties = await this.prisma.property.findMany({
        where,
        include: {
          media: { orderBy: { order: 'asc' } },
          owner: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (properties.length > 0) {
        return properties.map((prop) => this.calculateFees(prop));
      }
    } catch (error) {
      console.warn('⚠️ Banco de dados offline ou sem dados');
    }

    return [];
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        media: { orderBy: { order: 'asc' } },
        owner: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      },
    });

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    return this.calculateFees(property);
  }

  async create(ownerId: string, data: any) {
    const serviceFee = Math.round(data.rentPrice * 0.08); // 8% i7 Service Fee

    const property = await this.prisma.property.create({
      data: {
        ownerId,
        title: data.title,
        description: data.description,
        type: data.type || 'APARTMENT',
        status: data.status || 'PUBLISHED',
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state || 'SP',
        zipCode: data.zipCode,
        latitude: data.latitude || -23.55052,
        longitude: data.longitude || -46.633308,
        rentPrice: Number(data.rentPrice),
        salePrice: data.salePrice ? Number(data.salePrice) : null,
        condoFee: Number(data.condoFee || 0),
        iptuFee: Number(data.iptuFee || 0),
        serviceFee,
        bedrooms: Number(data.bedrooms || 1),
        bathrooms: Number(data.bathrooms || 1),
        parkingSpots: Number(data.parkingSpots || 0),
        areaSqm: Number(data.areaSqm || 50),
        furnished: Boolean(data.furnished),
        petFriendly: Boolean(data.petFriendly),
        hasVirtualTour: Boolean(data.hasVirtualTour),
        virtualTourUrl: data.virtualTourUrl,
        media: {
          create: (data.mediaUrls || []).map((url: string, index: number) => ({
            url,
            type: 'PHOTO',
            order: index,
          })),
        },
      },
      include: {
        media: true,
      },
    });

    return this.calculateFees(property);
  }

  async getOwnerProperties(ownerId: string) {
    const properties = await this.prisma.property.findMany({
      where: { ownerId },
      include: {
        media: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return properties.map((p) => this.calculateFees(p));
  }

  private calculateFees(property: any) {
    const totalMonthly = property.rentPrice + property.condoFee + property.iptuFee + property.serviceFee;
    return {
      ...property,
      totalMonthly,
    };
  }
}

const SEED_FALLBACK_PROPERTIES: any[] = [];

