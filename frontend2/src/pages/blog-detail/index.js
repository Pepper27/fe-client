import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const contentHtml = useMemo(() => {
    const raw = blog?.content;
    return typeof raw === "string" ? raw : "";
  }, [blog?.content]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.getBlogBySlug(slug);
        if (cancelled) return;
        setBlog(res?.data || null);
      } catch (e) {
        if (!cancelled) setBlog(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        Đang tải...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        Không tìm thấy bài viết
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <h1 style={{ marginBottom: 12 }}>{blog?.name || ""}</h1>
      {blog?.avatar ? (
        <img
          src={blog.avatar}
          alt={blog?.name || ""}
          style={{
            width: "100%",
            maxHeight: 420,
            objectFit: "cover",
            borderRadius: 12,
            marginBottom: 16,
          }}
        />
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </div>
  );
}
