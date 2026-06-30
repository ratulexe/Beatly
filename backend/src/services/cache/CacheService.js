import NodeCache from 'node-cache';
import logger from '../../config/logger.js';
import { env } from '../../config/env.js';

class CacheService {
  constructor() {
    this.driver = env.CACHE_DRIVER || 'memory';
    
    if (this.driver === 'memory') {
      // stdTTL: default time to live in seconds (1 hour default)
      this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
      logger.info('CacheService initialized with memory driver');
    } else if (this.driver === 'redis') {
      logger.info('CacheService initialized with redis driver pending implementation');
      // Future: Initialize ioredis client here
    } else {
      logger.warn(`Unknown cache driver: ${this.driver}. Falling back to memory.`);
      this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
      this.driver = 'memory';
    }
  }

  /**
   * Get a value from the cache
   * @param {string} key 
   * @returns {Promise<any>}
   */
  async get(key) {
    try {
      if (this.driver === 'memory') {
        return this.cache.get(key);
      } else {
        // Future Redis implementation
        // const val = await this.redis.get(key);
        // return val ? JSON.parse(val) : null;
        return null; 
      }
    } catch (error) {
      logger.error(`[Cache GET Error] ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in the cache
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlInSeconds 
   */
  async set(key, value, ttlInSeconds = 3600) {
    try {
      if (this.driver === 'memory') {
        this.cache.set(key, value, ttlInSeconds);
      } else {
        // Future Redis implementation
        // await this.redis.set(key, JSON.stringify(value), 'EX', ttlInSeconds);
      }
    } catch (error) {
      logger.error(`[Cache SET Error] ${key}:`, error);
    }
  }

  /**
   * Delete a key from the cache
   * @param {string} key 
   */
  async del(key) {
    try {
      if (this.driver === 'memory') {
        this.cache.del(key);
      } else {
        // Future Redis implementation
        // await this.redis.del(key);
      }
    } catch (error) {
      logger.error(`[Cache DEL Error] ${key}:`, error);
    }
  }

  /**
   * Delete keys matching a pattern
   * @param {string} pattern - simple string match for memory, or regex if implemented
   */
  async delPattern(pattern) {
    try {
      if (this.driver === 'memory') {
        const keys = this.cache.keys();
        const keysToDelete = keys.filter(k => k.includes(pattern));
        if (keysToDelete.length > 0) {
          this.cache.del(keysToDelete);
        }
      } else {
        // Future Redis implementation
        // const keys = await this.redis.keys(`*${pattern}*`);
        // if (keys.length > 0) await this.redis.del(keys);
      }
    } catch (error) {
      logger.error(`[Cache DEL PATTERN Error] ${pattern}:`, error);
    }
  }
}

export const cacheService = new CacheService();
