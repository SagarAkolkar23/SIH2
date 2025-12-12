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
 * Note: Backend automatically sets isActive=true when motorStatus='ON'
 * ESP32 checks both motorStatus='ON' AND isActive=true before turning motor on
 */
export const useControlCleanerMotor = () => {
  return useMutation({
    mutationFn: async ({ robotId = 'CLEANER-01', motorStatus, isActive }) => {
      if (!motorStatus || !['ON', 'OFF'].includes(motorStatus)) {
        throw new Error('motorStatus must be "ON" or "OFF"');
      }

      const response = await api.post('/api/cleaner-robot/motor-control', {
        robotId,
        motorStatus,
        isActive,
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

