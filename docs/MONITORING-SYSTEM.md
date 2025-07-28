# Monitoring & Analytics System - Military Tees UK

## Overview

The Military Tees UK platform includes a comprehensive monitoring and analytics system that tracks errors, performance metrics, user behavior, and business conversions. The system provides real-time insights into application health and user engagement.

## System Architecture

### Core Components

1. **Error Tracking Service** (`src/lib/monitoring/error-tracking.ts`)
   - Application error capture and reporting
   - Multiple provider support (Sentry, LogTail, Custom)
   - Contextual error information
   - User session tracking

2. **Analytics Service** (`src/lib/monitoring/analytics.ts`)
   - User behavior tracking
   - Performance monitoring
   - Conversion tracking
   - Web Vitals measurement

3. **API Endpoints** (`src/app/api/monitoring/`)
   - Error reporting endpoint
   - Analytics data collection
   - Performance metrics storage

4. **React Components**
   - Error Boundary with military-themed UI
   - Analytics Provider for context management
   - Performance monitoring hooks

## Error Tracking

### Features

- **Automatic Error Capture**: JavaScript errors, API failures, React component errors
- **Contextual Information**: User ID, session data, URL, user agent
- **Severity Levels**: Low, Medium, High, Critical
- **Error Categorization**: Payment, Authentication, API, React errors
- **Real-time Alerts**: Critical errors trigger immediate notifications

### Usage Examples

```typescript
import { captureError, capturePaymentError, captureAPIError } from '@/lib/monitoring/error-tracking'

// Basic error capture
try {
  await riskyOperation()
} catch (error) {
  await captureError(error, {
    severity: 'high',
    tags: { operation: 'riskyOperation' }
  })
}

// Payment-specific error
try {
  await processPayment(paymentData)
} catch (error) {
  await capturePaymentError(error, { orderId: order.id, amount: order.total })
}

// API error with context
try {
  const response = await fetch('/api/products')
  if (!response.ok) throw new Error(`API Error: ${response.status}`)
} catch (error) {
  await captureAPIError(error, '/api/products', response.status)
}
```

### Error Boundary Integration

```tsx
import { ErrorBoundary } from '@/components/monitoring/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

## Analytics & Performance Monitoring

### Tracked Metrics

#### User Behavior
- Page views and navigation patterns
- Product interactions (views, cart additions)
- Search queries and results
- Custom quote requests
- Newsletter signups

#### Performance Metrics
- **Web Vitals**: LCP, FCP, FID, CLS, TTFB
- **Custom Metrics**: Page load time, API response time, search performance
- **Technical Metrics**: Memory usage, connection type, device information

#### Business Conversions
- Purchase completions
- Quote request submissions
- User registrations
- Email newsletter subscriptions

### Usage Examples

```typescript
import { trackEvent, trackPageView, trackConversion, trackPerformance } from '@/lib/monitoring/analytics'

// Track user interactions
await trackEvent('product_view', {
  product_id: product.id,
  category: product.category,
  price: product.price
})

// Track business conversions
await trackConversion({
  event: 'purchase',
  value: order.total,
  currency: 'GBP',
  orderId: order.id,
  items: order.items
})

// Track performance metrics
await trackPerformance({
  pageLoadTime: 1250,
  apiResponseTime: 200,
  LCP: 1800
})
```

### React Provider Setup

```tsx
import { AnalyticsProvider } from '@/components/monitoring/analytics-provider'

function App({ userId }: { userId?: string }) {
  return (
    <AnalyticsProvider userId={userId}>
      <MyApp />
    </AnalyticsProvider>
  )
}
```

## Database Schema

### Error Tracking Tables

- **error_logs**: Application errors with full context
- **performance_metrics**: Custom performance measurements

### Analytics Tables

- **analytics_pageviews**: Page navigation tracking
- **analytics_events**: Custom user interactions
- **analytics_conversions**: Business conversion events
- **analytics_performance**: Web Vitals and performance data

### Monitoring Views

- **error_summary**: Error statistics by level and time
- **pageview_analytics**: Daily page view summaries
- **conversion_analytics**: Conversion tracking by type
- **performance_overview**: Performance metrics overview

## Configuration

### Environment Variables

```bash
# Error Tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOGTAIL_TOKEN=your_logtail_token

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=militarytees.co.uk
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://militarytees.co.uk
```

### Development Setup

1. **Install Dependencies**:
   ```bash
   npm install @sentry/nextjs @sentry/react @sentry/node
   ```

2. **Configure Environment**:
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your configuration
   ```

3. **Database Setup**:
   ```sql
   -- Run monitoring schema
   psql -f database/monitoring-schema.sql
   ```

### Production Setup

1. **Sentry Configuration**:
   - Create Sentry project
   - Configure DSN in environment variables
   - Set up alerts for critical errors

2. **Analytics Configuration**:
   - Set up Plausible Analytics domain
   - Configure Google Analytics if needed
   - Verify tracking implementation

## API Endpoints

### Error Reporting

**POST /api/monitoring/errors**

Accepts error events and stores them in the database.

```json
{
  "message": "Payment processing failed",
  "level": "critical",
  "context": {
    "userId": "user_123",
    "userEmail": "customer@example.com",
    "url": "/checkout",
    "tags": { "category": "payment" }
  }
}
```

### Analytics Data

**POST /api/monitoring/analytics**

Accepts analytics events for tracking user behavior.

```json
{
  "eventType": "custom_event",
  "data": {
    "name": "product_view",
    "properties": {
      "product_id": "prod_123",
      "category": "t-shirts"
    }
  }
}
```

### Performance Metrics

**POST /api/monitoring/performance**

Accepts performance metrics for monitoring.

```json
{
  "name": "page_load_time",
  "value": 1250,
  "unit": "ms",
  "tags": { "page": "/products" }
}
```

**GET /api/monitoring/performance**

Retrieves performance metrics with optional filtering.

Query parameters:
- `metric`: Filter by specific metric name
- `timeRange`: Time range (1h, 6h, 24h, 7d, 30d)
- `environment`: Filter by environment

## Monitoring Dashboards

### Error Monitoring

Track application health with error analytics:

- Error count by severity level
- Error trends over time
- Top error messages and locations
- Affected user count
- Resolution status tracking

### Performance Monitoring

Monitor application performance:

- Web Vitals compliance (LCP, FCP, FID, CLS)
- Page load time trends
- API response time monitoring
- Performance alerts and thresholds
- Device and connection analysis

### Business Analytics

Track business metrics:

- Conversion funnel analysis
- Revenue tracking by source
- User engagement metrics
- Product performance analytics
- Customer journey analysis

## Alerting & Notifications

### Error Alerts

- **Critical Errors**: Immediate email/Slack notification
- **High Error Rate**: Alert when error rate exceeds threshold
- **New Error Types**: Notification for previously unseen errors
- **User Impact**: Alert when multiple users affected

### Performance Alerts

- **Web Vitals**: Alert when core metrics exceed thresholds
- **API Performance**: Slow API response alerts
- **Page Load Time**: Performance degradation alerts
- **Resource Usage**: High memory usage warnings

### Business Alerts

- **Conversion Drop**: Alert on significant conversion decreases
- **Revenue Impact**: Financial impact notifications
- **User Engagement**: Unusual user behavior patterns
- **System Health**: Overall platform health status

## Data Retention

### Retention Policies

- **Error Logs**: 90 days (low/medium), 1 year (high/critical)
- **Page Views**: 6 months
- **Custom Events**: 6 months
- **Conversions**: 2 years
- **Performance Data**: 30 days
- **Performance Metrics**: 90 days

### Cleanup Process

Automated cleanup runs daily via `cleanup_monitoring_data()` function:

```sql
-- Manual cleanup execution
SELECT cleanup_monitoring_data();
```

## Security & Privacy

### Data Protection

- **User Privacy**: No PII stored in error logs
- **Data Encryption**: All data encrypted at rest
- **Access Control**: Row-level security policies
- **Audit Trail**: All monitoring data access logged

### Compliance

- **GDPR Compliance**: User data handling compliant
- **Data Minimization**: Only necessary data collected
- **Consent Management**: User tracking consent respected
- **Right to Deletion**: User data removal capabilities

## Best Practices

### Error Handling

1. **Meaningful Messages**: Provide clear, actionable error messages
2. **Context Information**: Include relevant context for debugging
3. **Error Boundaries**: Wrap components with error boundaries
4. **Graceful Degradation**: Ensure errors don't break user experience

### Performance Monitoring

1. **Core Metrics**: Focus on Web Vitals and user-centric metrics
2. **Real User Monitoring**: Track actual user experiences
3. **Performance Budgets**: Set and monitor performance thresholds
4. **Continuous Optimization**: Regular performance analysis and improvements

### Analytics Implementation

1. **Event Naming**: Use consistent, descriptive event names
2. **Data Quality**: Validate analytics data before sending
3. **Privacy First**: Respect user privacy and consent
4. **Actionable Insights**: Focus on metrics that drive decisions

## Troubleshooting

### Common Issues

1. **High Error Rates**:
   - Check recent deployments
   - Verify third-party service status
   - Review error patterns and contexts

2. **Performance Degradation**:
   - Analyze slow API endpoints
   - Check database query performance
   - Review resource usage patterns

3. **Missing Analytics Data**:
   - Verify environment variable configuration
   - Check network connectivity
   - Review client-side JavaScript errors

### Debugging Tools

1. **Error Tracking**: Use error IDs to trace specific issues
2. **Performance Profiling**: Browser dev tools and server monitoring
3. **Analytics Validation**: Test events in development mode
4. **Database Queries**: Use monitoring views for data analysis

## Integration Examples

### E-commerce Tracking

```typescript
// Track product interactions
const handleAddToCart = async (product: Product, quantity: number) => {
  try {
    await addToCart(product, quantity)
    
    // Track successful add to cart
    await trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity
    })
  } catch (error) {
    // Track cart error
    await captureError(error, {
      severity: 'medium',
      tags: { operation: 'add_to_cart', product_id: product.id }
    })
  }
}

// Track purchase completion
const handlePurchaseComplete = async (order: Order) => {
  await trackConversion({
    event: 'purchase',
    value: order.total,
    currency: 'GBP',
    orderId: order.id,
    items: order.items.map(item => ({
      id: item.product_id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price
    }))
  })
}
```

### Search Performance Tracking

```typescript
const handleSearch = async (query: string) => {
  const timer = startTimer('search_operation')
  
  try {
    const results = await searchProducts(query)
    
    // Track search performance
    timer() // This will track the duration
    
    // Track search behavior
    await trackEvent('search', {
      query,
      results_count: results.length
    })
    
    return results
  } catch (error) {
    await captureAPIError(error, '/api/search')
    throw error
  }
}
```

## Future Enhancements

### Planned Features

1. **Real-time Dashboards**: Live monitoring dashboards
2. **Machine Learning**: Anomaly detection and predictive analytics
3. **A/B Testing**: Built-in experimentation framework
4. **Custom Alerts**: User-configurable alert rules
5. **Mobile Analytics**: Enhanced mobile app tracking

### Integration Opportunities

1. **Business Intelligence**: Integration with BI tools
2. **Customer Support**: Link errors to support tickets
3. **Marketing Analytics**: Enhanced conversion attribution
4. **Inventory Management**: Performance impact on stock levels

For technical support or questions about the monitoring system, contact the development team or refer to the main project documentation.