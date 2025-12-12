import { get, put } from './request'

export function getMe() {
  return get('/users/me')
}

export function updateProfile(data) {
  return put('/users/profile', data)
}

export function getMyStores(params = {}) {
  return get('/users/me/contributions/stores', params)
}

export function getMyMenuItems(params = {}) {
  return get('/users/me/contributions/menu-items', params)
}

