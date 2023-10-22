import { jest } from '@jest/globals';
import dotenv from 'dotenv';

jest.useFakeTimers();
dotenv.config({ path: './__tests__/test.env' });
