import { FuelLogService } from './fuel-logs';
import { CarService } from './cars';
import { MileageChartData, SpendChartData, ChartDataPoint } from '@/types';
import { getCarUnits, convertCurrency, convertDistance, convertVolume } from '@/lib/units';

export class AnalyticsService {
  static async getMileageTrends(carId: string, months: number = 12): Promise<MileageChartData[]> {
    const { logs } = await FuelLogService.calculateMileageForCar(carId);
    const car = await CarService.getCarById(carId);
    const { efficiencyUnit } = getCarUnits(car);
    
    // Filter logs with mileage data from the last N months
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const mileageData = logs
      .filter(log => log.mileage && new Date(log.filled_at) >= cutoffDate)
      .map(log => ({
        date: log.filled_at,
        value: log.mileage!,
        label: `${log.mileage!.toFixed(1)} ${efficiencyUnit}`,
        kmpl: log.mileage!,
        distance: log.distance || 0,
        liters: log.liters,
      }))
      .reverse(); // Chronological order
    
    return mileageData;
  }

  static async getSpendingTrends(carId: string, months: number = 12): Promise<SpendChartData[]> {
    const logs = await FuelLogService.getFuelLogs(carId);
    const car = await CarService.getCarById(carId);
    const { currencySymbol } = getCarUnits(car);
    
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
        label: `${currencySymbol}${data.amount.toLocaleString()}`,
        amount: data.amount,
        liters: data.liters,
        fills: data.fills,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return spendData;
  }

  static async getCostPerKmTrends(carId: string, months: number = 12): Promise<ChartDataPoint[]> {
    const logs = await FuelLogService.getFuelLogs(carId);
    const car = await CarService.getCarById(carId);
    const { currencySymbol, distanceUnit } = getCarUnits(car);
    
    // Calculate cost per km/mi for periods between fills
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
          label: `${currencySymbol}${costPerKm.toFixed(2)}/${distanceUnit}`,
        });
      }
    }
    
    return costData;
  }

  static async getFuelPriceTrends(carId: string, months: number = 12): Promise<ChartDataPoint[]> {
    const logs = await FuelLogService.getFuelLogs(carId);
    const car = await CarService.getCarById(carId);
    const { currencySymbol, volumeUnit } = getCarUnits(car);
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const priceData = logs
      .filter(log => log.price_per_l && new Date(log.filled_at) >= cutoffDate)
      .map(log => ({
        date: log.filled_at,
        value: log.price_per_l!,
        label: `${currencySymbol}${log.price_per_l!.toFixed(2)}/${volumeUnit}`,
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
    
    let totalSpendInInr = 0;
    let totalLitersInL = 0;
    let totalDistanceInKm = 0;
    let monthlySpendInInr = 0;

    for (let i = 0; i < cars.length; i++) {
      const car = cars[i]!;
      const stats = allStats[i];
      const { currency, distanceUnit, volumeUnit } = getCarUnits(car);

      totalSpendInInr += convertCurrency(stats.totalSpend, currency, 'INR');
      monthlySpendInInr += convertCurrency(stats.last30DaysSpend, currency, 'INR');
      totalDistanceInKm += convertDistance(stats.totalDistance, distanceUnit, 'km');

      if (volumeUnit === 'gal' || volumeUnit === 'L') {
        totalLitersInL += convertVolume(stats.totalLiters, volumeUnit, 'L');
      } else {
        totalLitersInL += stats.totalLiters;
      }
    }
    
    const averageMileage = totalLitersInL > 0 ? totalDistanceInKm / totalLitersInL : 0;
    const costPerKm = totalDistanceInKm > 0 ? totalSpendInInr / totalDistanceInKm : 0;
    
    return {
      totalCars: cars.length,
      totalSpend: totalSpendInInr,
      totalLiters: totalLitersInL,
      totalDistance: totalDistanceInKm,
      averageMileage,
      costPerKm,
      monthlySpend: monthlySpendInInr,
    };
  }
}
