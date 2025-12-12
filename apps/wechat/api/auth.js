import { post, get, put } from './request'
export function register(data) {
  return post('/auth/register', data)
}
export function login(data) {
  return post('/auth/login', data)
}
export function getUserInfo() {
  return get('/users/me')
}
export function updateUserProfile(data) {
  return put('/users/profile', data)
}
