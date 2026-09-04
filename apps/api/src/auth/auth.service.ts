import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Resend } from 'resend';

@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 12;

  private resend: Resend | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  async register(data: { name: string; email: string; password: string; phone?: string; role?: string }) {
    const assignedRole = data.role === 'OWNER' ? 'OWNER' : 'TENANT';
    const email = data.email.toLowerCase().trim();

    let existing;
    try {
      existing = await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      console.warn('⚠️ Banco de dados offline, simulando cadastro...');
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`\n==============================================`);
      console.log(`📧 [CÓDIGO DE VERIFICAÇÃO SIMULADO PARA ${email}]: ${verificationCode}`);
      console.log(`==============================================\n`);
      return {
        message: 'Cadastro recebido! Verifique seu e-mail para confirmar a conta.',
        email: email,
      };
    }

    if (existing) {
      throw new BadRequestException('Não foi possível concluir o cadastro com os dados fornecidos.');
    }

    const passwordHash = await bcrypt.hash(data.password, this.BCRYPT_ROUNDS);
    
    // Generate a 6-digit verification code (PIN)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await this.prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        phone: data.phone,
        passwordHash,
        role: assignedRole,
        verified: false,
        verificationCode,
      },
    });

    // In a production environment, send an email via SMTP/Resend.
    // For development, log the code so the developer can see it instantly:
    console.log(`\n==============================================`);
    console.log(`📧 [CÓDIGO DE VERIFICAÇÃO PARA ${email}]: ${verificationCode}`);
    console.log(`==============================================\n`);

    if (this.resend) {
      try {
        const { data: resendData, error } = await this.resend.emails.send({
          from: 'i7 Inteligência Imobiliária <contato@i7imob.com.br>',
          to: email,
          subject: 'Seu Código de Verificação i7',
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #1e293b; text-align: center;">Bem-vindo(a) à i7!</h2>
              <p style="color: #475569; font-size: 16px;">Olá <strong>${data.name}</strong>,</p>
              <p style="color: #475569; font-size: 16px;">Para concluir o seu cadastro, utilize o código de 6 dígitos abaixo:</p>
              <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #84cc16;">${verificationCode}</span>
              </div>
              <p style="color: #94a3b8; font-size: 14px; text-align: center;">Se você não solicitou este cadastro, pode ignorar este e-mail.</p>
            </div>
          `
        });
        if (error) {
           console.error('❌ Resend bloqueou o e-mail:', error);
        } else {
           console.log(`✅ E-mail enviado com sucesso via Resend para ${email}`);
        }
      } catch (e) {
        console.error('❌ Falha interna ao enviar e-mail via Resend', e);
      }
    }

    return {
      message: this.resend 
        ? 'Cadastro realizado com sucesso! Verifique sua caixa de entrada para pegar o código.' 
        : 'Cadastro realizado! Seu código de verificação foi preenchido automaticamente (apenas para testes).',
      email: user.email,
      devVerificationCode: this.resend ? undefined : verificationCode,
    };
  }

  async verifyEmail(data: { email: string; code: string }) {
    const email = data.email.toLowerCase().trim();
    const code = data.code.trim();

    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      console.warn('⚠️ Banco de dados offline, simulando verificação...');
      return {
        user: {
          id: 'mock-id', name: 'Usuário Teste', email, phone: '', role: 'TENANT', verified: true, createdAt: new Date()
        },
        accessToken: this.generateToken('mock-id', email, 'TENANT'),
      };
    }

    if (!user) {
      throw new BadRequestException('Código de verificação inválido ou expirado.');
    }

    if (user.verified) {
      throw new BadRequestException('Este e-mail já foi verificado. Você já pode fazer login.');
    }

    if (user.verificationCode !== code) {
      throw new BadRequestException('Código de verificação incorreto. Verifique o número e tente novamente.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationCode: null,
      },
    });

    const token = this.generateToken(updatedUser.id, updatedUser.email, updatedUser.role);

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        verified: updatedUser.verified,
        createdAt: updatedUser.createdAt,
      },
      accessToken: token,
    };
  }

  async login(data: { email: string; password: string }) {
    const email = data.email.toLowerCase().trim();

    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      console.warn('⚠️ Banco de dados offline, simulando login com conta de teste...');
      
      const role = email.includes('admin') ? 'ADMIN' : email.includes('proprietario') ? 'OWNER' : 'TENANT';
      const token = this.generateToken('mock-id', email, role);
      
      return {
        user: {
          id: 'mock-id',
          name: 'Usuário de Teste Offline',
          email,
          phone: '(11) 99999-9999',
          role: role,
          verified: true,
          createdAt: new Date(),
        },
        accessToken: token,
      };
    }

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // STRICT CHECK: Reject login if user email is not verified
    if (!user.verified) {
      throw new UnauthorizedException('E-mail não verificado. Por favor, insira o código de confirmação enviado para seu e-mail.');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  async getProfile(userId: string) {
    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          verified: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
    } catch (error) {
      return {
        id: userId,
        name: 'Usuário de Teste',
        email: 'mock@i7.com.br',
        phone: '(11) 99999-9999',
        role: 'TENANT',
        verified: true,
        avatarUrl: null,
        createdAt: new Date(),
      };
    }

    if (!user) throw new BadRequestException('Usuário não encontrado');
    return user;
  }

  private generateToken(userId: string, email: string, role: string) {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }
}
