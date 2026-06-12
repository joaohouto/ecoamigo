import { RateLimiterMemory } from 'rate-limiter-flexible'

// 5 submissões por IP a cada 10 minutos
export const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 600,
})
