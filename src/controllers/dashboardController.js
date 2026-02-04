import db from '../config/database.js';

/**
 * Get dashboard statistics with date filter
 * Returns summary of properties, sales, and financial data
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no dates provided
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Property counts by status
    const propertyStats = await db`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'available') as available_count,
        COUNT(*) FILTER (WHERE status = 'sold') as sold_count,
        COUNT(*) FILTER (WHERE status = 'reserved') as reserved_count,
        COUNT(*) as total_count
      FROM properties
    `;

    // Sales stats within date range
    const salesStats = await db`
      SELECT 
        COUNT(*) as total_sales,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_sales,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_sales,
        COALESCE(SUM(sale_price) FILTER (WHERE status = 'completed'), 0) as total_revenue
      FROM property_sales
      WHERE sale_date >= ${start} AND sale_date <= ${end}
    `;

    // Financial summary within date range
    const financialStats = await db`
      SELECT 
        COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) as total_income,
        COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) as total_expense,
        COUNT(*) as total_transactions
      FROM financial_transactions
      WHERE transaction_date >= ${start} AND transaction_date <= ${end}
    `;

    // Low stock inventory count
    const inventoryStats = await db`
      SELECT 
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE quantity <= min_stock) as low_stock_count
      FROM inventory
    `;

    res.json({
      success: true,
      data: {
        dateRange: { start, end },
        properties: propertyStats[0],
        sales: salesStats[0],
        financial: {
          ...financialStats[0],
          net_balance: parseFloat(financialStats[0].total_income) - parseFloat(financialStats[0].total_expense)
        },
        inventory: inventoryStats[0]
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get financial chart data with date filter
 * Returns time series data grouped by day/week/month
 */
export const getFinanceChart = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // Default to last 30 days if no dates provided
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let dateFormat;
    let dateGroup;
    
    switch (groupBy) {
      case 'month':
        dateFormat = db`TO_CHAR(transaction_date, 'YYYY-MM')`;
        dateGroup = db`DATE_TRUNC('month', transaction_date)`;
        break;
      case 'week':
        dateFormat = db`TO_CHAR(DATE_TRUNC('week', transaction_date), 'YYYY-MM-DD')`;
        dateGroup = db`DATE_TRUNC('week', transaction_date)`;
        break;
      default: // day
        dateFormat = db`TO_CHAR(transaction_date, 'YYYY-MM-DD')`;
        dateGroup = db`transaction_date`;
    }

    const chartData = await db`
      SELECT 
        ${dateFormat} as period,
        COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) as income,
        COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) as expense
      FROM financial_transactions
      WHERE transaction_date >= ${start} AND transaction_date <= ${end}
      GROUP BY ${dateGroup}
      ORDER BY ${dateGroup} ASC
    `;

    res.json({
      success: true,
      data: {
        dateRange: { start, end },
        groupBy,
        chart: chartData
      }
    });
  } catch (error) {
    console.error('Finance chart error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get property status distribution
 * Returns count of properties by status
 */
export const getPropertyStatus = async (req, res) => {
  try {
    const statusData = await db`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(price), 0) as total_value
      FROM properties
      GROUP BY status
      ORDER BY count DESC
    `;

    // Also get property type distribution
    const typeData = await db`
      SELECT 
        type,
        COUNT(*) as count,
        COALESCE(AVG(price), 0) as avg_price
      FROM properties
      GROUP BY type
      ORDER BY count DESC
    `;

    res.json({
      success: true,
      data: {
        byStatus: statusData,
        byType: typeData
      }
    });
  } catch (error) {
    console.error('Property status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get recent transactions (sales and financial)
 * Returns combined list of recent activities
 */
export const getRecentTransactions = async (req, res) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit) || 10);

    // Recent sales
    const recentSales = await db`
      SELECT 
        ps.id,
        'sale' as transaction_type,
        ps.buyer_name as description,
        ps.sale_price as amount,
        ps.status,
        ps.sale_date as date,
        p.name as property_name
      FROM property_sales ps
      LEFT JOIN properties p ON ps.property_id = p.id
      ORDER BY ps.created_at DESC
      LIMIT ${limit}
    `;

    // Recent financial transactions
    const recentFinancial = await db`
      SELECT 
        ft.id,
        ft.type as transaction_type,
        ft.description,
        ft.amount,
        ft.category as status,
        ft.transaction_date as date,
        p.name as property_name
      FROM financial_transactions ft
      LEFT JOIN properties p ON ft.property_id = p.id
      ORDER BY ft.created_at DESC
      LIMIT ${limit}
    `;

    // Combine and sort by date
    const allTransactions = [...recentSales, ...recentFinancial]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.json({
      success: true,
      data: {
        transactions: allTransactions,
        sales: recentSales,
        financial: recentFinancial
      }
    });
  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get sales chart data with date filter
 * Returns time series data for sales
 */
export const getSalesChart = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let dateFormat;
    let dateGroup;
    
    switch (groupBy) {
      case 'month':
        dateFormat = db`TO_CHAR(sale_date, 'YYYY-MM')`;
        dateGroup = db`DATE_TRUNC('month', sale_date)`;
        break;
      case 'week':
        dateFormat = db`TO_CHAR(DATE_TRUNC('week', sale_date), 'YYYY-MM-DD')`;
        dateGroup = db`DATE_TRUNC('week', sale_date)`;
        break;
      default:
        dateFormat = db`TO_CHAR(sale_date, 'YYYY-MM-DD')`;
        dateGroup = db`sale_date`;
    }

    const chartData = await db`
      SELECT 
        ${dateFormat} as period,
        COUNT(*) as sales_count,
        COALESCE(SUM(sale_price) FILTER (WHERE status = 'completed'), 0) as revenue
      FROM property_sales
      WHERE sale_date >= ${start} AND sale_date <= ${end}
      GROUP BY ${dateGroup}
      ORDER BY ${dateGroup} ASC
    `;

    res.json({
      success: true,
      data: {
        dateRange: { start, end },
        groupBy,
        chart: chartData
      }
    });
  } catch (error) {
    console.error('Sales chart error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
