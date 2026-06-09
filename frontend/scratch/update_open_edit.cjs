const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminVideoManage.jsx', 'utf8');

const target = `  const openEditModal = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDesc(video.description || "");
    setEditCategory(video.category);
    setEditTags(video.tags || []);
    setEditThumbUrl(video.thumbnailUrl || "");
    setNewThumbFile(null);
    setThumbProgress(0);
    setCourseId("");
    setModuleName("");
    setVideoOrder("");
    setIsEditModalOpen(true);
  };`;

const replacement = `  const openEditModal = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDesc(video.description || "");
    setEditCategory(video.category);
    setEditTags(video.tags || []);
    setEditThumbUrl(video.thumbnailUrl || "");
    setNewThumbFile(null);
    setThumbProgress(0);

    // Auto-detect if video is already in a course
    let foundCourseId = "";
    let foundModuleName = "";
    let foundOrder = "";
    
    if (courses && courses.length > 0) {
      for (const course of courses) {
        if (course.modules) {
          for (const module of course.modules) {
            if (module.videos) {
              const v = module.videos.find(vid => vid.url === video.videoUrl || vid.title === video.title);
              if (v) {
                foundCourseId = course._id;
                foundModuleName = module.title;
                foundOrder = v.order || "";
                break;
              }
            }
          }
        }
        if (foundCourseId) break;
      }
    }

    setCourseId(foundCourseId);
    setModuleName(foundModuleName);
    setVideoOrder(foundOrder);
    setIsEditModalOpen(true);
  };`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/AdminVideoManage.jsx', content);
console.log('Successfully updated openEditModal');
