import fs from 'fs'
import path from 'path'
import prisma from '../database/prisma.js'

function safeStat(p){ try { return fs.statSync(p) } catch { return null } }

function listFilesRecursive(dir, exts = ['.tsx','.ts','.jsx','.js']){
  const out = []
  const st = safeStat(dir); if (!st || !st.isDirectory()) return out
  const stack = [dir]
  while (stack.length){
    const d = stack.pop()
    const items = fs.readdirSync(d)
    for (const name of items){
      const full = path.join(d, name)
      const s = safeStat(full); if (!s) continue
      if (s.isDirectory()) stack.push(full)
      else if (exts.includes(path.extname(full))) out.push(full.replace(/\\/g,'/'))
    }
  }
  return out
}

export async function runDevScan(){
  const projectRoot = path.join(process.cwd(), '..')
  const pagesDir = path.join(projectRoot, 'src', 'pages')
  const componentsDir = path.join(projectRoot, 'src', 'components')
  const srcDir = path.join(projectRoot, 'src')
  const serverRoutesDir = path.join(process.cwd(), 'routes')

  const pageFiles = listFilesRecursive(pagesDir)
  const componentFiles = listFilesRecursive(componentsDir)
  const srcFiles = listFilesRecursive(srcDir)
  const routeFiles = listFilesRecursive(serverRoutesDir)

  function readText(f){ try { return fs.readFileSync(f, 'utf-8') } catch { return '' } }
  // Extract frontend route patterns from code (<Route path="..."> and track("..."))
  const routeRegexes = [
    /path\s*=\s*\{?track\(\s*(["'`][^"'`]+["'`])\s*\)\}?/g,
    /path\s*=\s*(["'`][^"'`]+["'`])/g,
  ]
  const frontendPatternsSet = new Set()
  for (const f of srcFiles){
    const txt = readText(f)
    for (const re of routeRegexes){
      let m
      while ((m = re.exec(txt))){
        const raw = m[1]
        const val = String(raw).slice(1, -1)
        if (val) frontendPatternsSet.add(val)
      }
    }
  }
  const frontendPatterns = Array.from(frontendPatternsSet).filter(p => p.startsWith('/'))

  // Extract backend express routes
  const beRe = /router\.(get|post|put|delete|patch)\(\s*(["'`][^"'`]+["'`])/g
  const backendPatternsSet = new Set()
  for (const f of routeFiles){
    const txt = readText(f)
    let m
    while ((m = beRe.exec(txt))){
      const raw = m[2]
      const val = String(raw).slice(1, -1)
      if (val) backendPatternsSet.add(val)
    }
  }
  const backendPatterns = Array.from(backendPatternsSet)

  // DB fetches (best-effort)
  let users = [], articles = [], universities = [], pages = [], groups = [], orientationResources = [], orientationCategories = [], tags = [], categories = []
  try {
    const userResults = await prisma.user.findMany({
      select: { id: true, username: true, email: true, firstName: true, lastName: true },
      take: 500
    })
    users = userResults.map(u => ({ 
      id: u.id, 
      username: u.username, 
      email: u.email, 
      first_name: u.firstName, 
      last_name: u.lastName,
      full_name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || null 
    }))
  } catch (e) { console.error('Scanner: users error', e.message) }
  try {
    const articleResults = await prisma.article.findMany({
      select: { id: true, slug: true, title: true, published: true, content: true },
      take: 1000
    })
    articles = articleResults.map(a => ({ 
      id: a.id, 
      slug: a.slug, 
      title: a.title, 
      published: a.published, 
      _content: typeof a.content === 'string' ? a.content : null 
    }))
  } catch (e) { console.error('Scanner: articles error', e.message) }
  try {
    const uniResults = await prisma.university.findMany({
      select: { id: true, slug: true, name: true },
      take: 1000
    })
    universities = uniResults.map(u => ({ id: u.id, slug: u.slug, name: u.name }))
  } catch (e) { console.error('Scanner: universities error', e.message) }
  try {
    const pageResults = await prisma.staticPage.findMany({
      select: { slug: true, title: true, published: true },
      take: 1000
    })
    pages = pageResults.map(p => ({ slug: p.slug, title: p.title, status: p.published }))
  } catch (e) { console.error('Scanner: pages error', e.message) }
  try {
    const groupResults = await prisma.universityGroup.findMany({
      select: { id: true, slug: true, name: true },
      take: 1000
    })
    groups = groupResults.map(g => ({ id: g.id, slug: g.slug, name: g.name }))
  } catch (e) { console.error('Scanner: groups error', e.message) }
  try {
    const orrResults = await prisma.orientationResource.findMany({
      select: { id: true, category: true, slug: true, title: true },
      take: 2000
    })
    orientationResources = orrResults.map(r => ({ id: r.id, category: r.category, slug: r.slug, title: r.title }))
  } catch (e) { console.error('Scanner: orientation resources error', e.message) }
  // Note: Taxonomies don't have a 'type' field in the schema, skipping orientation categories, tags, categories

  const now = new Date().toISOString()
  const result = {
    generatedAt: now,
    projectRoot,
    files: {
      pages: pageFiles,
      components: componentFiles,
      src: srcFiles,
      serverRoutes: routeFiles,
    },
    data: {
      users,
      articles,
      universities,
      staticPages: pages,
      universityGroups: groups,
      orientationCategories,
      orientationResources,
      tags,
      categories,
    },
    derived: {
      userPaths: users.filter(u=>u.username).map(u=>`/u/${u.username}`),
      articlePaths: articles.filter(a=>a.slug).map(a=>`/blog/${a.slug}`),
      universityPaths: universities.filter(u=>u.slug).map(u=>`/universities/${u.slug}`),
      staticPagePaths: pages.filter(p=>p.slug).map(p=>`/${p.slug}`),
      groupPaths: groups.filter(g=>g.slug).map(g=>`/university-groups/${g.slug}`),
      orientationCategoryPaths: orientationCategories.filter(c=>c.slug).map(c=>`/orientation/${c.slug}`),
      orientationResourcePaths: orientationResources.filter(r=>r.category && r.slug).map(r=>`/orientation/${r.category}/${r.slug}`),
      articleMeta: articles.map(a => ({ slug: a.slug, title: a.title, published: a.published, hasContent: !!(a._content && a._content.length > 10) })),
      frontendRoutePatterns: frontendPatterns,
      backendRoutePatterns: backendPatterns,
    }
  }

  // Persist snapshot
  const outDir = path.join(process.cwd(), 'tmp')
  if (!safeStat(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'dev-scan.json')
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf-8')
  return result
}


