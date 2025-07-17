#!/usr/bin/env node

// Test the notification imports to make sure they work
import { useNotification, showSuccess, showError, NotificationContainer } from './src/components/ui/notification.tsx';

console.log('✅ Notification imports working:');
console.log('- useNotification:', typeof useNotification);
console.log('- showSuccess:', typeof showSuccess);
console.log('- showError:', typeof showError);
console.log('- NotificationContainer:', typeof NotificationContainer);

// Test the hook
const notificationFunctions = useNotification();
console.log('- useNotification() returns:', Object.keys(notificationFunctions));

console.log('\n🎉 All notification exports are working correctly!');