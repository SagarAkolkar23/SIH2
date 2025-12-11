import { useMutation } from '@tanstack/react-query';
import { api } from '../../api/useQuery';

/**
 * Cleaner Robot Service
 * Handles cleaner robot motor control and status
 */

/**
 * Control cleaner robot motor (ON/OFF)
 * POST /api/cleaner-robot/motor-control
 * @param {string} robotId - Robot ID (default: 'CLEANER-01')
 * @param {string} motorStatus - 'ON' or 'OFF'
 */
export const useControlCleanerMotor = () => {
  return useMutation({
    mutationFn: async ({ robotId = 'CLEANER-01', motorStatus }) => {
      if (!motorStatus || !['ON', 'OFF'].includes(motorStatus)) {
        throw new Error('motorStatus must be "ON" or "OFF"');
      }
      
      const response = await api.post('/api/cleaner-robot/motor-control', {
        robotId,
        motorStatus
      });
      
      return response.data;
    },
  });
};

/**
 * Get cleaner robot status
 * GET /api/cleaner-robot/app-status?robotId=CLEANER-01
 */
export const useCleanerRobotStatus = (robotId = 'CLEANER-01') => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get(`/api/cleaner-robot/app-status?robotId=${robotId}`);
      return response.data;
    },
  });
};

