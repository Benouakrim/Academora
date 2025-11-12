# How to Update Feature Status

Quick guide for updating the Explore page as features are implemented.

## File Location
`src/pages/ExplorePage.tsx`

## Updating a Feature Status

### 1. Find the Feature
Locate the feature in the `features` array (around line 47):

```typescript
const features: Feature[] = [
  // ... features
  {
    id: 'mentorship',
    title: 'Mentorship Network',
    // ...
    status: 'coming-soon',  // Change this
    // ...
  }
]
```

### 2. Change Status

**From Coming Soon to Beta:**
```typescript
status: 'beta',
availability: 'Available in beta',
// Remove estimatedLaunch if present
```

**From Beta to Live:**
```typescript
status: 'live',
link: '/mentorship',  // Add the route
// Remove availability and estimatedLaunch
```

### 3. Add Implementation Link

When moving to live, always add the route:
```typescript
{
  id: 'mentorship',
  status: 'live',
  link: '/mentorship',  // Users can now access it
  // ...
}
```

## Status Colors

The system automatically applies these styles:

- **Live**: Green badge with checkmark ✓
- **Beta**: Blue badge with sparkles ✨
- **Coming Soon**: Purple badge with clock 🕐

## Adding New Features

To add a new feature to the list:

```typescript
{
  id: 'unique-feature-id',
  icon: <IconName className="w-6 h-6" />,
  title: 'Feature Name',
  description: 'One-line description for card',
  longDescription: 'Detailed explanation for modal (2-3 sentences)',
  status: 'coming-soon',
  category: 'tools', // content | guidance | matching | tools | insights | community
  benefits: [
    'Benefit 1',
    'Benefit 2',
    'Benefit 3',
    'Benefit 4'
  ],
  estimatedLaunch: 'Q1 2026',
  availability: 'Premium feature' // optional
}
```

## Categories

Available categories:
- `content` - Content & Learning
- `guidance` - Guidance & Planning  
- `matching` - Smart Matching
- `tools` - Tools & Calculators
- `insights` - Career Insights
- `community` - Community

## Quick Updates Checklist

When implementing a feature:

1. [ ] Update status in ExplorePage.tsx
2. [ ] Add route in App.tsx if live
3. [ ] Remove estimatedLaunch field
4. [ ] Add link property
5. [ ] Update availability if needed
6. [ ] Test that "Try Now" button works
7. [ ] Update benefits if they changed during development

## Example: Launching Mentorship

**Before (Coming Soon):**
```typescript
{
  id: 'mentorship',
  title: 'Mentorship Network',
  status: 'coming-soon',
  estimatedLaunch: 'Q1 2026',
  availability: 'Premium feature',
  // no link
}
```

**After (Live):**
```typescript
{
  id: 'mentorship',
  title: 'Mentorship Network',
  status: 'live',
  link: '/mentorship',
  availability: 'Premium feature',
  // removed estimatedLaunch
}
```

## Updating Launch Dates

If a feature is delayed, just update the estimate:
```typescript
estimatedLaunch: 'Q2 2026', // was Q1 2026
```

## Bulk Updates

To update multiple features at once, search for the status:
```
status: 'coming-soon'
```

Then update each one individually based on development progress.

## Testing After Updates

1. Visit `/explore`
2. Check that status badge is correct
3. For live features: click card and verify "Try Now" button works
4. For coming soon: verify button is disabled
5. Check that filters still work
6. Verify search still finds the feature

## Notes

- Always keep benefits list to 4 items for consistency
- Keep description under 100 characters
- Keep longDescription under 250 characters
- Use sentence case for titles
- Include icons from lucide-react
- Maintain alphabetical order within status groups (optional but nice)

---

**Remember**: The Explore page is a living document of your platform's progress. Keep it updated to maintain user trust and excitement!
