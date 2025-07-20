import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Admin from '@/models/Admin';
import BusDriver from '@/models/BusDriver';
import BusAgent from '@/models/BusAgent';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          
          const { email, password, role } = credentials;
          let user = null;
          let userRole = role;

          // First, try to find user in the main User collection
          user = await User.findOne({ email });
          
          if (user) {
            userRole = user.role || 'passenger';
          } else {
            // If not found in User collection, check role-specific collections
            switch (role) {
              case 'admin':
                user = await Admin.findOne({ email });
                if (user) userRole = 'admin';
                break;
              case 'busdriver':
                user = await BusDriver.findOne({ email });
                if (user) userRole = 'busdriver';
                break;
              case 'busagent':
                user = await BusAgent.findOne({ email }).populate('company', 'name');
                if (user) userRole = 'busagent';
                break;
            }
          }

          if (!user) {
            return null;
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: userRole
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  }
};
