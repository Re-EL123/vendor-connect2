# VendorConnect Firestore Database Structure

## Collections Overview

### 1. users
Stores all user account information

```
users/{uid}
  - uid: string (user ID)
  - name: string (full name)
  - email: string
  - phone: string
  - province: string (SA Province)
  - city: string (SA City)
  - address: string (optional)
  - role: string ("basic" | "admin")
  - subscriptionType: string ("basic" | "business" | "premium")
  - isVendor: boolean
  - businessName: string (if vendor)
  - category: string (if vendor)
  - businessDescription: string (if vendor)
  - profileImage: string (URL, optional)
  - createdAt: timestamp
  - updatedAt: timestamp
```

### 2. posts
User-generated content feed

```
posts/{postId}
  - uid: string (author ID)
  - description: string
  - title: string (optional)
  - imageURL: string (optional)
  - province: string
  - city: string
  - category: string (optional)
  - likes: array<string> (user IDs who liked)
  - views: number
  - commentsCount: number
  - isRepost: boolean (optional)
  - originalPostId: string (if repost)
  - originalAuthorId: string (if repost)
  - createdAt: timestamp
```

### 3. comments
Comments on posts

```
comments/{commentId}
  - postId: string
  - userId: string
  - comment: string
  - timestamp: timestamp
```

### 4. chats
Chat conversations between users

```
chats/{chatId}
  - users: array<string> (participant user IDs)
  - lastMessage: string
  - timestamp: timestamp
  
  messages subcollection:
  messages/{messageId}
    - senderId: string
    - text: string
    - imageURL: string (optional)
    - timestamp: timestamp
    - read: boolean
```

### 5. vendors
Business vendor profiles

```
vendors/{vendorId}
  - uid: string
  - name: string (business name)
  - description: string
  - category: string
  - email: string
  - phone: string
  - imageURL: string (logo)
  - isApproved: boolean
  - subscriptionStatus: string ("pending" | "active" | "cancelled")
  - createdAt: timestamp
  
  products subcollection:
  products/{productId}
    - name: string
    - description: string
    - price: number
    - imageURL: string
    - category: string
    - stock: number
    - createdAt: timestamp
```

### 6. likes
Like records

```
likes/{likeId}
  - postId: string
  - uid: string
  - timestamp: timestamp
```

### 7. follows
Follow relationships

```
follows/{followId}
  - uid: string (follower)
  - vendorId: string (followed vendor)
  - timestamp: timestamp
```

### 8. ratings
Vendor ratings and reviews

```
ratings/{ratingId}
  - postId: string (optional)
  - uid: string (reviewer)
  - value: number (1-5)
  - review: string (optional)
  - timestamp: timestamp
```

### 9. subscriptions
Subscription management

```
subscriptions/{uid}
  - uid: string
  - plan: string ("basic" | "business" | "premium")
  - status: string ("active" | "cancelled" | "pending")
  - startDate: timestamp
  - endDate: timestamp (optional)
  - autoRenew: boolean
  - updatedAt: timestamp
```

### 10. admin_logs
Admin activity tracking

```
admin_logs/{logId}
  - adminId: string
  - action: string
  - targetId: string (optional)
  - targetType: string (optional - "user" | "post" | "vendor")
  - details: string
  - timestamp: timestamp
```

### 11. notifications
User notifications

```
notifications/{notificationId}
  - recipientId: string
  - senderId: string
  - type: string ("like" | "comment" | "follow" | "message" | "admin")
  - postId: string (optional)
  - message: string
  - read: boolean
  - createdAt: timestamp
```

### 12. views
Post view tracking

```
views/{viewId}
  - postId: string
  - uid: string
  - timestamp: timestamp
```

### 13. marketplace_orders
E-commerce orders

```
marketplace_orders/{orderId}
  - buyerId: string
  - vendorId: string
  - products: array<object>
    - productId: string
    - name: string
    - price: number
    - quantity: number
  - totalAmount: number
  - status: string ("pending" | "confirmed" | "shipped" | "delivered" | "cancelled")
  - deliveryAddress: object
    - street: string
    - city: string
    - province: string
    - postalCode: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

### 14. reports
Content and user reports

```
reports/{reportId}
  - reporterId: string
  - targetId: string
  - targetType: string ("post" | "user" | "comment")
  - reason: string
  - description: string
  - status: string ("pending" | "reviewed" | "resolved")
  - createdAt: timestamp
  - resolvedAt: timestamp (optional)
  - resolvedBy: string (admin ID, optional)
```

## Security Rules Recommendations

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function canPost() {
      let userData = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return userData.subscriptionType in ['business', 'premium'];
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Posts collection
    match /posts/{postId} {
      allow read: if true; // Public read
      allow create: if isSignedIn() && canPost();
      allow update: if isOwner(resource.data.uid) || isAdmin();
      allow delete: if isOwner(resource.data.uid) || isAdmin();
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read: if isSignedIn() && request.auth.uid in resource.data.users;
      allow create: if isSignedIn();
      allow update: if isSignedIn() && request.auth.uid in resource.data.users;
      
      match /messages/{messageId} {
        allow read: if isSignedIn() && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.users;
        allow create: if isSignedIn() && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.users;
      }
    }
    
    // Vendors collection
    match /vendors/{vendorId} {
      allow read: if true;
      allow create: if isOwner(vendorId) && canPost();
      allow update: if isOwner(vendorId) || isAdmin();
      allow delete: if isAdmin();
      
      match /products/{productId} {
        allow read: if true;
        allow write: if isOwner(vendorId) || isAdmin();
      }
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isOwner(resource.data.recipientId);
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.recipientId);
      allow delete: if isOwner(resource.data.recipientId);
    }
    
    // Admin logs
    match /admin_logs/{logId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Other collections
    match /likes/{likeId} {
      allow read: if true;
      allow write: if isSignedIn();
    }
    
    match /follows/{followId} {
      allow read: if true;
      allow write: if isSignedIn();
    }
    
    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.uid);
    }
    
    match /subscriptions/{subId} {
      allow read: if isOwner(subId) || isAdmin();
      allow write: if isAdmin();
    }
    
    match /reports/{reportId} {
      allow read: if isAdmin() || isOwner(resource.data.reporterId);
      allow create: if isSignedIn();
      allow update: if isAdmin();
    }
  }
}
```

## Indexes Needed

Create these composite indexes in Firestore:

1. **posts** collection:
   - `createdAt` (Descending) + `province` (Ascending)
   - `createdAt` (Descending) + `category` (Ascending)
   - `uid` (Ascending) + `createdAt` (Descending)

2. **chats** collection:
   - `users` (Array) + `timestamp` (Descending)

3. **notifications** collection:
   - `recipientId` (Ascending) + `read` (Ascending) + `createdAt` (Descending)

4. **vendors** collection:
   - `category` (Ascending) + `isApproved` (Ascending)
   - `province` (Ascending) + `category` (Ascending)

5. **comments** collection:
   - `postId` (Ascending) + `timestamp` (Descending)
```

```html file="" isHidden
