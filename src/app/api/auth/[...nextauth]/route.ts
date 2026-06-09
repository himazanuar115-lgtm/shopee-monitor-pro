import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db'; // Pastikan path ini benar ke instance Prisma Anda
import bcrypt from 'bcryptjs'; // Pastikan Anda telah menginstal 'bcryptjs'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn('[NextAuth] Missing email or password in request');
          throw new Error('Email dan password harus diisi.');
        }

        // 1. Cari pengguna berdasarkan email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          console.warn('[NextAuth] User not found for email:', credentials.email);
          throw new Error('Email atau password salah.');
        }

        // 2. Bandingkan password yang diberikan dengan password yang di-hash di database
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          console.warn('[NextAuth] Password mismatch for user:', credentials.email);
          throw new Error('Email atau password salah.');
        }

        // 3. Pastikan pengguna aktif
        if (!user.isActive) {
          console.warn('[NextAuth] Account is inactive for user:', credentials.email);
          throw new Error('Akun Anda tidak aktif. Silakan hubungi administrator.');
        }

        // Jika otentikasi berhasil, kembalikan objek user
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as string,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Menambahkan id ke token
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role; // Menambahkan role ke token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Pastikan properti id dan role ada di token
        (session.user as any).id = token.id; 
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Halaman login kustom Anda
    error: '/login', // Redirect ke halaman login jika ada error
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
