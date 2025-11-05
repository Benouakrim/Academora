# Error Tracking Guide

This guide serves as a comprehensive reference for handling recurring errors in the AcademOra project. It's designed for both AI agents (to avoid repeating failed solutions) and developers (as learning material).

---

## Error #1: EADDRINUSE - Address Already in Use

### **Error Details**
- **Name**: `EADDRINUSE`
- **Type**: System/Network Error
- **Severity**: Medium (Blocks server startup)
- **Frequency**: High (Common during development)

### **Error Message**
```
Error: listen EADDRINUSE: address already in use :::3001
    at Server.setupListenHandle [as _listen2] (node:net:1940:16)
    at listenInCluster (node:net:1997:12)
    at Server.listen (node:net:2102:7)
```

### **Non-Programmer Explanation**
> "The computer's door (port 3001) is already occupied by another program. Think of it like trying to park in a spot that's already taken - you need to either move the other car or find a different spot."

### **Technical Explanation**
The Node.js server is attempting to bind to port 3001, but another process is already listening on that port. This happens when:
- Previous server instance didn't shut down properly
- Multiple development servers running
- Process terminated but port wasn't released
- Hot reload tools leave zombie processes

### **Root Causes**
1. **Improper Process Termination**: Using Ctrl+C doesn't always clean up properly
2. **Multiple Terminals**: Running server in multiple terminal windows
3. **Hot Reload Issues**: `--watch` flag can create zombie processes
4. **Background Processes**: Server running as background service
5. **IDE Integration**: Some IDEs keep processes alive

---

## Solution History & Tracking

### **Occurrence #1** - *November 4, 2025, 11:04 PM UTC*

#### **Initial Detection**
- **Context**: User ran `npm run dev:server` after image upload implementation
- **Environment**: Windows PowerShell, Node.js v22.18.0
- **PID**: 16836 (first instance), 21296 (second instance)

#### **Attempted Solutions**

##### ❌ **Solution 1: Direct Restart** - FAILED
```bash
npm run dev:server
```
**Result**: Same EADDRINUSE error
**Learning**: Simply restarting doesn't resolve port conflicts

##### ✅ **Solution 2: Process Identification & Termination** - SUCCESS
```bash
# Step 1: Find process using the port
netstat -ano | findstr :3001

# Step 2: Kill the specific process
taskkill /PID 21296 /F
```

**Result**: Server successfully started after process termination
**Success Rate**: 100%
**Time to Resolve**: ~30 seconds

#### **Working Solution Procedure**

1. **Identify the Process**
   ```bash
   netstat -ano | findstr :3001
   ```
   - Look for LISTENING state
   - Note the PID (Process ID)

2. **Terminate the Process**
   ```bash
   taskkill /PID [PID_NUMBER] /F
   ```
   - `/F` flag forces termination
   - Confirm success message

3. **Verify Port is Free**
   ```bash
   netstat -ano | findstr :3001
   ```
   - Should return no results

4. **Restart Server**
   ```bash
   npm run dev:server
   ```

#### **Alternative Solutions (Documented for Future Reference)**

##### 🔄 **Solution 3: Change Port** - WORKAROUND
```javascript
// In server/index.js
const PORT = process.env.PORT || 3002; // Change to different port
```
**Use Case**: When you can't terminate the other process
**Downside**: Need to update frontend API URL

##### 🔄 **Solution 4: Find and Kill All Node Processes** - NUCLEAR OPTION
```bash
# Windows
taskkill /IM node.exe /F

# Or more specific
for /f "tokens=5" %a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %a
```
**Use Case**: Multiple conflicting Node processes
**Warning**: Kills ALL Node processes

##### 🔄 **Solution 5: Wait for Automatic Release** - PASSIVE
- Wait 2-5 minutes for OS to release port
- Sometimes works with TIME_WAIT connections
**Success Rate**: Low (~20%)

---

## Prevention Strategies

### **Development Practices**
1. **Proper Shutdown**: Always use Ctrl+C before closing terminal
2. **Single Instance**: Avoid running multiple servers
3. **Port Management**: Use different ports for different projects
4. **Process Monitoring**: Check running processes before starting

### **Code Improvements**
```javascript
// Add error handling for port conflicts
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    console.log('Try: netstat -ano | findstr :' + PORT);
    process.exit(1);
  }
});
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "dev:server": "node --watch server/index.js",
    "kill:server": "for /f \"tokens=5\" %a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %a",
    "restart:server": "npm run kill:server && npm run dev:server"
  }
}
```

---

## Debugging Checklist

### **When EADDRINUSE Occurs:**
- [ ] Check if server is running in another terminal
- [ ] Use `netstat -ano | findstr :3001` to find PID
- [ ] Kill the process with `taskkill /PID [PID] /F`
- [ ] Verify port is free with `netstat` again
- [ ] Restart server
- [ ] If still failing, try different port
- [ ] Document any unusual circumstances

### **Information to Collect:**
- **PID**: Process ID using the port
- **Process Name**: What application is using it
- **Terminal Count**: How many terminals are open
- **Recent Changes**: What was modified before error
- **Time**: When error occurred
- **Frequency**: First time or recurring

---

## Related Errors

### **EACCES (Permission Denied)**
- **Different from EADDRINUSE**: Port requires admin privileges
- **Solution**: Use ports > 1024 or run as administrator

### **ENOTFOUND (Host Not Found)**
- **Different**: Network connectivity issue
- **Solution**: Check network configuration

### **ETIMEDOUT (Connection Timeout)**
- **Different**: Server not responding
- **Solution**: Check if server is actually running

---

## AI Agent Notes for Future Occurrences

### **What Works (Proven Solutions):**
1. `netstat -ano | findstr :3001` → `taskkill /PID [PID] /F`
2. This is the most reliable approach for Windows

### **What to Avoid:**
1. Simply restarting without killing process (never works)
2. Waiting for automatic release (low success rate)
3. Changing ports without addressing root cause

### **Quick Resolution Path:**
1. Run netstat command
2. Kill identified process
3. Restart server
4. If fails, document unusual circumstances

### **Escalation Criteria:**
- If same PID keeps reappearing
- If multiple processes on same port
- If error occurs immediately after proper shutdown
- If user reports they didn't have server running

---

## Learning Points for Developers

### **Understanding Ports**
- Ports are like doors for network communication
- Only one program can use each port at a time
- Ports 1-1023 require admin privileges
- Development commonly uses 3000, 3001, 8000, 8080

### **Process Management**
- Processes don't always clean up properly when terminated
- `netstat` shows network connections and processes
- `taskkill` forcefully terminates processes
- PID (Process ID) uniquely identifies each process

### **Development Best Practices**
- Always stop servers properly before closing IDE
- Use process managers (PM2, nodemon) for better control
- Monitor running processes during development
- Document port usage for team projects

---

## Error #2: Route Mismatch - 404 on Admin Edit

### **Error Details**
- **Name**: Route Not Found (404)
- **Type**: Routing Error
- **Severity**: Medium (Blocks admin functionality)
- **Frequency**: Low (Configuration issue)

### **Error Message**
```
Route not found: /admin/edit/[article-id]
Returns 404 page instead of article editor
```

### **Non-Programmer Explanation**
> "The address (URL) for the edit page doesn't match what the system expects. It's like trying to open a door with the wrong key - the door exists, but you're using the wrong key."

### **Technical Explanation**
The navigation path in admin controls doesn't match the route defined in React Router. This happens when:
- Route paths are updated but navigation isn't同步
- Inconsistent URL patterns across components
- Manual URL construction instead of centralized routing

### **Root Causes**
1. **Route Definition**: `/admin/articles/edit/:id` in App.tsx
2. **Navigation Call**: `/admin/edit/:id` in admin controls
3. **Missing `/articles/` segment** in navigation path

---

## Solution History & Tracking

### **Occurrence #1** - *November 4, 2025, 11:22 PM UTC*

#### **Initial Detection**
- **Context**: User clicked "Edit Article" button from blog page
- **Expected**: Article editor should open
- **Actual**: 404 page displayed
- **Environment**: React Router v6, TypeScript

#### **Problem Analysis**
```javascript
// Route in App.tsx (CORRECT)
<Route path="/admin/articles/edit/:id" element={<ArticleEditor />} />

// Navigation in BlogPage.tsx (INCORRECT)
navigate(`/admin/edit/${articleId}`)

// Navigation in ArticlePage.tsx (INCORRECT)  
navigate(`/admin/edit/${article.id}`)
```

#### **Solution Applied**

##### ✅ **Solution 1: Update Navigation Paths** - SUCCESS
```javascript
// Fixed BlogPage.tsx
const handleEditArticle = (articleId: string) => {
  navigate(`/admin/articles/edit/${articleId}`)  // Added /articles/
}

// Fixed ArticlePage.tsx
const handleEditArticle = () => {
  if (article) {
    navigate(`/admin/articles/edit/${article.id}`)  // Added /articles/
  }
}
```

**Result**: Edit buttons now correctly navigate to article editor
**Success Rate**: 100%
**Time to Resolve**: ~5 minutes

#### **Working Solution Procedure**

1. **Identify Route Mismatch**
   - Check `App.tsx` for correct route definition
   - Search for navigation calls using the route
   - Compare path patterns

2. **Update Navigation Paths**
   - Ensure all navigate() calls match route definitions
   - Use consistent URL patterns
   - Test navigation from all entry points

3. **Verify Fix**
   - Test edit button from blog page
   - Test edit button from article page
   - Confirm article editor loads correctly

#### **Prevention Strategies**

### **Development Practices**
1. **Centralized Routes**: Define route paths in constants
2. **Route Verification**: Test all navigation after route changes
3. **Consistent Patterns**: Use same URL structure throughout
4. **Documentation**: Keep route list updated

### **Code Improvements**
```javascript
// Create route constants
export const ROUTES = {
  ADMIN_EDIT_ARTICLE: '/admin/articles/edit/:id',
  ADMIN_NEW_ARTICLE: '/admin/articles/new',
  // ... other routes
}

// Use in components
navigate(ROUTES.ADMIN_EDIT_ARTICLE.replace(':id', articleId))
```

### **Testing Checklist**
- [ ] Test edit from blog listing
- [ ] Test edit from article page
- [ ] Test edit from admin dashboard
- [ ] Verify URL parameters are passed correctly
- [ ] Check 404 page doesn't appear for valid routes

---

## Related Errors

### **Missing Route Parameter**
- **Different**: Route exists but parameter not passed
- **Solution**: Ensure parameter is included in navigate() call

### **Wrong Component Loading**
- **Different**: Route works but wrong component loads
- **Solution**: Check route definition and component imports

### **Protected Route Access**
- **Different**: Route exists but access denied
- **Solution**: Check authentication and authorization

---

## AI Agent Notes for Future Occurrences

### **What Works (Proven Solutions):**
1. Compare route definition with navigation calls
2. Update all navigation paths to match routes
3. Test from multiple entry points

### **What to Avoid:**
1. Only testing from one location
2. Hardcoding URLs in multiple places
3. Forgetting to update all references

### **Quick Resolution Path:**
1. Check App.tsx for correct route
2. Search for all navigate() calls using that route
3. Update paths to match exactly
4. Test from blog page and article page

### **Escalation Criteria:**
- If route exists but still 404
- If parameters aren't being passed
- If multiple conflicting routes exist

---

*Last Updated: November 4, 2025*  
*Next Review: After next occurrence*  
*Maintainer: AI Agent Cascade*
