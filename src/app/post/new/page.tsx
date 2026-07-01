"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { CATEGORY_LIST } from "@/lib/validations/post";
import { ImportRepoModal } from "@/components/ImportRepoModal";
import { Import } from "lucide-react";

export default function NewPostPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Sign in to create a post.</p>
      </div>
    );
  }

  const handleImportSelect = (repo: {
    title: string;
    description: string;
    githubRepo: string;
  }) => {
    setTitle(repo.title);
    setDescription(repo.description);
    setGithubRepo(repo.githubRepo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !category) {
      setError("Title and category are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          image_url: imageUrl,
          github_repo: githubRepo || undefined,
          demo_url: demoUrl || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create post");
      }

      const { data: post } = await res.json();
      router.push(`/post/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Share your project</h1>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowImport(true)}
          className="gap-2"
        >
          <Import className="h-4 w-4" />
          Import
        </Button>
      </div>

      <ImportRepoModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onSelect={handleImportSelect}
      />

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-6">
        {/* Image upload */}
        <ImageUpload onUploadComplete={setImageUrl} />

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Project Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., I built a CLI tool for..."
            maxLength={120}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your project do? What did you learn?"
            maxLength={500}
            rows={3}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_LIST.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* GitHub repo */}
        <div className="space-y-2">
          <Label htmlFor="githubRepo">GitHub Repository</Label>
          <Input
            id="githubRepo"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            placeholder="https://github.com/username/repo"
          />
        </div>

        {/* Demo URL */}
        <div className="space-y-2">
          <Label htmlFor="demoUrl">Demo URL (optional)</Label>
          <Input
            id="demoUrl"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://your-project.vercel.app"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Publishing..." : "Publish Project"}
        </Button>
      </form>
    </div>
  );
}
