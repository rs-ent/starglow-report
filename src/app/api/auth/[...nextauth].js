// src/pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import Providers from "next-auth/providers";

export default NextAuth({
  providers: [
    Providers.Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "rs.ent.contact", type: "text"},
        password: { label: "fptmf01!", type: "password"}
      },
      async authorize(credentials) {
        // 여기서 사용자 인증 로직을 구현합니다.
        // 예: 데이터베이스에서 사용자 조회 및 권한 확인
        const user = await getUserFromDB(credentials.username, credentials.password);
        if (user) {
          return user;
        } else {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.role = user.role; // 사용자 역할 저장
      }
      return token;
    },
    async session(session, token) {
      session.user.role = token.role; // 세션에 사용자 역할 추가
      return session;
    }
  }
});