import { FuelLogService } from './fuel-logs';
import { CarService } from './cars';
import { MileageChartData, SpendChartData, ChartDataPoint } from '@/types';

export class AnalyticsService {
  static async getMileageTrends(carId: string, months: number = 12): Promise<MileageChartData[]> {
    const { logs } = await FuelLogService.calculateMileageForCar(carId);
    
    // Filter logs with mileage data from the last N months
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const mileageData = logs
      .filter(log => log.mileage && new Date(log.filled_at) >= cutoffDate)
      .map(log => ({
        date: log.filled_at,
        value: log.mileage!,
        label: `${log.mileage!.toFixed(1)} km/L`,
        kmpl: log.mileage!,
        distance: log.distance || 0,
        liters: log.liters,
      }))
      .reverse(); // Chronological order
    
    return mileageData;
  }

  static async getSpendingTrends(carId: string, months: number = 12): Promise<SpendChartData[]> {
    const logs = await FuelLogService.getFuelLogs(carId);
    
    // Group logs by month
    const monthlyData = new Map<string, { amount: number; liters: number; fills: number }>();
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    logs
      .filter(log => new Date(log.filled_at) >= cutoffDate)
      .forEach(log => {
        const monthKey = new Date(log.filled_at).toISOString().slice(0, 7); // YYYY-MM
        const existing = monthlyData.get(monthKey) || { amount: 0, liters: 0, fills: 0 };
        
        monthlyData.set(monthKey, {
          amount: existing.amount + (log.total_cost || 0),
          liters: existing.liters + log.liters,
          fills: existing.fills + 1,
        });
      });
    
    // Convert to chart data
    const spendData: SpendChartData[] = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        date: month,
        value: data.amount,
        label: `₹${data.amount.toLocaleString()}`,
        amount: data.amount,
        liters: data.liters,
        fills: data.fills,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return spendData;
  }

  static async getCostPerKmTrends(carId: string, months: number = 12): Promise<ChartDataPoint[]> {
    const logs = await FuelLogService.getFuelLogs(carId);
    
    // Calculate cost per km for periods between fills
    const costData: ChartDataPoint[] = [];
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const sortedLogs = logs
      .filter(log => new Date(log.filled_at) >= cutoffDate)
      .sort((a, b) => new Date(a.filled_at).getTime() - new Date(b.filled_at).getTime());
    
    for (let i = 1; i < sortedLogs.length; i++) {
      const currentLog = sortedLogs[i];
      const previousLog = sortedLogs[i - 1];
      
      const distance = currentLog.odometer_km - previousLog.odometer_km;
      const cost = currentLog.total_cost || 0;
      
      if (distance > 0 && cost > 0) {
        const costPerKm = cost / distance;
        costData.push({
          date: currentLog.filled_at,
          value: costPerKm,
          label: `₹${costPerKm.toFixed(2)}/km`,
        });
      }
    }
    
    return costData;
  }

  static async getFuelPriceTrends(carId: string, months: number = 12): Promise<ChartDataPoint[]> {
    const logs = await FuelLogService.getFuelLogs(carId);
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const priceData = logs
      .filter(log => log.price_per_l && new Date(log.filled_at) >= cutoffDate)
      .map(log => ({
        date: log.filled_at,
        value: log.price_per_l!,
        label: `₹${log.price_per_l!.toFixed(2)}/L`,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return priceData;
  }

  static async getOverallAnalytics(carIds?: string[]): Promise<{
    totalCars: number;
    totalSpend: number;
    totalLiters: number;
    totalDistance: number;
    averageMileage: number;
    costPerKm: number;
    monthlySpend: number;
  }> {
    let cars;
    if (carIds) {
      cars = await Promise.all(carIds.map(id => CarService.getCarById(id)));
      cars = cars.filter(car => car !== null);
    } else {
      cars = await CarService.getCars();
    }
    
    const allStats = await Promise.all(
      cars.map(car => FuelLogService.getCarStatistics(car!.id))
    );
    
    const totalSpend = allStats.reduce((sum, stats) => sum + stats.totalSpend, 0);
    const totalLiters = allStats.reduce((sum, stats) => sum + stats.totalLiters, 0);
    const totalDistance = allStats.reduce((sum, stats) => sum + stats.totalDistance, 0);
    const monthlySpend = allStats.reduce((sum, stats) => sum + stats.last30DaysSpend, 0);
    
    // Calculate weighted average mileage
    const totalMileageWeighted = allStats.reduce((sum, stats) => {
      return sum + (stats.averageMileage * stats.totalDistance);
    }, 0);
    const averageMileage = totalDistance > 0 ? totalMileageWeighted / totalDistance : 0;
    
    const costPerKm = totalDistance > 0 ? totalSpend / totalDistance : 0;
    
    return {
      totalCars: cars.length,
      totalSpend,
      totalLiters,
      totalDistance,
      averageMileage,
      costPerKm,
      monthlySpend,
    };
  }
}
