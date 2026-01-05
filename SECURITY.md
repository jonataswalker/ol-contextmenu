# Security Policy

## What to Include in Your Report

Help us understand the issue by including:

1. **Type of vulnerability** (XSS, injection, etc.)
2. **Affected version(s)**
3. **Step-by-step instructions** to reproduce
4. **Proof of concept** (if applicable)
6. **Suggested fix** (if you have one)

## Security Best Practices

When using ol-contextmenu:

### Input Validation

Always validate and sanitize user input before displaying in menu items:

```javascript
// ❌ Unsafe - XSS vulnerability
{
    text: userInput, // Could contain malicious HTML
    callback: fn
}

// ✅ Safe - Sanitized
{
    text: sanitizeHTML(userInput),
    callback: fn
}
```

### Custom Callbacks

Be cautious with callbacks that execute user-controlled code:

```javascript
// ❌ Unsafe - eval is dangerous
{
    text: 'Execute',
    callback: (obj) => {
        eval(obj.data.code); // Never do this!
    }
}

// ✅ Safe - Validated actions
{
    text: 'Execute',
    callback: (obj) => {
        if (allowedActions.includes(obj.data.action)) {
            performAction(obj.data.action);
        }
    }
}
```

### Icon URLs

Validate icon URLs to prevent XSS:

```javascript
// ❌ Unsafe
{
    text: 'Item',
    icon: userProvidedURL // Could be javascript: or data: URL
}

// ✅ Safe
{
    text: 'Item',
    icon: isValidImageURL(userProvidedURL) ? userProvidedURL : defaultIcon
}
```

### Content Security Policy

Consider using CSP headers to mitigate XSS risks:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; img-src 'self' data: https:">
```

## Known Security Considerations

### DOM-based XSS

ol-contextmenu renders user-provided text and icons in the DOM. Always sanitize:

- Menu item text
- Icon URLs
- Custom CSS classes
- Data passed to callbacks

