const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/AdminVideoManage.jsx', 'utf8');

// 1. Add state variables
content = content.replace(
  '  const [editTagInput, setEditTagInput] = useState("");',
  `  const [editTagInput, setEditTagInput] = useState("");
  
  // Course Association states
  const [courseId, setCourseId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [videoOrder, setVideoOrder] = useState("");`
);

// 2. Add course fetching query
content = content.replace(
  '  // Fetch videos list',
  `  // Fetch courses for assignment
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => {
      const res = await api.get("/courses");
      return res.data;
    },
    enabled: !loading,
  });

  // Fetch videos list`
);

// 3. Reset states in openEditModal
content = content.replace(
  '    setThumbProgress(0);\n    setIsEditModalOpen(true);',
  `    setThumbProgress(0);
    setCourseId("");
    setModuleName("");
    setVideoOrder("");
    setIsEditModalOpen(true);`
);

// 4. Append to payload in handleSaveEdit
const saveEditTarget = `      const payload = {
        title: editTitle.trim(),
        description: editDesc.trim(),
        category: editCategory,
        tags: editTags,
        thumbnailUrl: finalThumbUrl,
      };`;

const saveEditReplacement = `      const payload = {
        title: editTitle.trim(),
        description: editDesc.trim(),
        category: editCategory,
        tags: editTags,
        thumbnailUrl: finalThumbUrl,
      };

      if (courseId) {
        if (!moduleName.trim()) {
          toast.error("Module name is required to associate video to the course");
          return;
        }
        payload.courseId = courseId;
        payload.moduleName = moduleName.trim();
        payload.videoOrder = Number(videoOrder) || "";
      }`;

content = content.replace(saveEditTarget, saveEditReplacement);

// 5. Inject the Course UI into the form
const formTarget = `                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-white">Tags (Press Enter or comma to add)</label>`;

const formReplacement = `                <div className="p-4 bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.15)] rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-[#C084FC] flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    <span>Curriculum Course Association</span>
                  </h3>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#C7C3D6]">Select Course (Optional)</label>
                    <select
                      value={courseId}
                      onChange={(e) => {
                        setCourseId(e.target.value);
                        setModuleName("");
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-[rgba(26,21,44,0.9)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                    >
                      <option value="">No Course (Standalone Video)</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  {courseId && (
                    <div className="space-y-3 animate-fade-in pt-2 border-t border-[rgba(139,92,246,0.1)]">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#C7C3D6]">Module Name</label>
                        <input
                          type="text"
                          value={moduleName}
                          onChange={(e) => setModuleName(e.target.value)}
                          placeholder="e.g. Introduction to React"
                          className="w-full px-4 py-2 rounded-xl bg-[rgba(26,21,44,0.9)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                          required={!!courseId}
                        />
                        {courses.find(c => c._id === courseId)?.modules?.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-2">
                            {courses.find(c => c._id === courseId).modules.map((mod, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setModuleName(mod.title)}
                                className={\`text-[10px] px-2 py-1 rounded-md border transition-colors \${moduleName === mod.title ? 'bg-[rgba(139,92,246,0.2)] border-[#A855F7] text-white' : 'border-[rgba(139,92,246,0.2)] text-[#C7C3D6] hover:bg-[rgba(139,92,246,0.1)]'}\`}
                              >
                                {mod.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#C7C3D6]">Video Order / Position</label>
                        <input
                          type="number"
                          value={videoOrder}
                          onChange={(e) => setVideoOrder(e.target.value)}
                          placeholder="Leave empty to auto-append"
                          className="w-full px-4 py-2 rounded-xl bg-[rgba(26,21,44,0.9)] border border-[rgba(139,92,246,0.25)] focus:border-[#A855F7] text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7] text-sm"
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-white">Tags (Press Enter or comma to add)</label>`;

content = content.replace(formTarget, formReplacement);

fs.writeFileSync('frontend/src/pages/AdminVideoManage.jsx', content);
console.log('Successfully updated AdminVideoManage.jsx');
