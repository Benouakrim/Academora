import supabase from '../server/database/supabase.js';

async function checkVideos() {
  console.log('=== Checking site_videos table ===\n');
  
  // Get all videos
  const { data: allVideos, error: allError } = await supabase
    .from('site_videos')
    .select('*')
    .order('position', { ascending: true });
  
  if (allError) {
    console.error('Error fetching all videos:', allError);
    return;
  }
  
  console.log(`Total videos in database: ${allVideos.length}`);
  console.log('\nAll videos:');
  allVideos.forEach((video, index) => {
    console.log(`${index + 1}. ${video.title}`);
    console.log(`   ID: ${video.id}`);
    console.log(`   Position: ${video.position}`);
    console.log(`   Is Active: ${video.is_active}`);
    console.log(`   Video URL: ${video.video_url || '(none)'}`);
    console.log(`   Embed Code: ${video.embed_code ? 'Yes' : 'No'}`);
    console.log('');
  });
  
  // Get only active videos
  const { data: activeVideos, error: activeError } = await supabase
    .from('site_videos')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true });
  
  if (activeError) {
    console.error('Error fetching active videos:', activeError);
    return;
  }
  
  console.log(`\n=== Active videos (is_active = true): ${activeVideos.length} ===`);
  activeVideos.forEach((video, index) => {
    console.log(`${index + 1}. ${video.title} (position: ${video.position})`);
  });
  
  const inactiveCount = allVideos.length - activeVideos.length;
  console.log(`\n=== Inactive videos (is_active = false): ${inactiveCount} ===`);
  const inactiveVideos = allVideos.filter(v => !v.is_active);
  inactiveVideos.forEach((video, index) => {
    console.log(`${index + 1}. ${video.title} (position: ${video.position})`);
  });
  
  process.exit(0);
}

checkVideos().catch(console.error);
