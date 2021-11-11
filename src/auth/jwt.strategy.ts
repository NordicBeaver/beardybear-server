import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const userId = payload.sub;
    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    if (user == null) {
      return false;
    }
    return { userId: userId, userRole: user?.role };
  }
}
