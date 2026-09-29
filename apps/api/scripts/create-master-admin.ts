import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function parseArgs(): { email?: string; password?: string; name?: string; phone?: string } {
  const args = process.argv.slice(2);
  let email: string | undefined;
  let password: string | undefined;
  let name: string | undefined;
  let phone: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--email' || arg === '-e') {
      email = args[++i];
    } else if (arg.startsWith('--email=')) {
      email = arg.split('=')[1];
    } else if (arg === '--password' || arg === '-p') {
      password = args[++i];
    } else if (arg.startsWith('--password=')) {
      password = arg.split('=')[1];
    } else if (arg === '--name' || arg === '-n') {
      name = args[++i];
    } else if (arg.startsWith('--name=')) {
      name = arg.split('=')[1];
    } else if (arg === '--phone') {
      phone = args[++i];
    } else if (arg.startsWith('--phone=')) {
      phone = arg.split('=')[1];
    } else if (!arg.startsWith('-')) {
      if (arg.includes('@') && !email) {
        email = arg;
      } else if (!password) {
        password = arg;
      }
    }
  }

  return { email, password, name, phone };
}

async function main() {
  console.log('====================================================');
  console.log('🛡️  i7 IMOBILIÁRIA - CRIAÇÃO DE USUÁRIO ADMINISTRADOR MESTRE');
  console.log('====================================================\n');

  const cli = parseArgs();

  const email = (
    cli.email || 
    process.env.ADMIN_EMAIL || 
    'admin@i7.com.br'
  ).toLowerCase().trim();

  const password = (
    cli.password || 
    process.env.ADMIN_PASSWORD
  );

  const name = (
    cli.name || 
    process.env.ADMIN_NAME || 
    'Administrador Master i7'
  ).trim();

  const phone = (
    cli.phone || 
    process.env.ADMIN_PHONE || 
    '(15) 3090-4000'
  ).trim();

  if (!email || !email.includes('@')) {
    console.error('❌ Erro: E-mail de administrador inválido.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('❌ Erro: Senha de administrador deve ter no mínimo 8 caracteres.');
    console.error('💡 Dica: Informe via argumento:');
    console.error('   npm run admin:create -- --email admin@i7.com.br --password "SuaSenhaForte#2026"');
    console.error('   Ou defina as variáveis de ambiente ADMIN_EMAIL e ADMIN_PASSWORD.');
    process.exit(1);
  }

  console.log(`ℹ️  Registrando Administrador Mestre para: ${email}`);

  // Hash com 12 rounds de salt (Padrão OWASP)
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        phone,
        passwordHash,
        role: 'ADMIN',
        verified: true,
        verificationCode: null,
      },
    });
    console.log(`✅ Usuário existente atualizado com perfil de ADMIN e senha redefinida com sucesso!`);
    console.log(`👤 ID: ${updated.id}`);
    console.log(`📧 E-mail: ${updated.email}`);
    console.log(`🛡️  Role: ${updated.role}`);
  } else {
    const created = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'ADMIN',
        verified: true,
      },
    });
    console.log(`✅ Novo Administrador Mestre criado com sucesso!`);
    console.log(`👤 ID: ${created.id}`);
    console.log(`📧 E-mail: ${created.email}`);
    console.log(`🛡️  Role: ${created.role}`);
  }

  console.log('\n🔒 As credenciais estão protegidas e prontas para uso em ambiente de produção.');
}

main()
  .catch((e) => {
    console.error('❌ Falha na criação do administrador:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
