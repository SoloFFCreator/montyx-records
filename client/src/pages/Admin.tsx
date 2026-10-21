import { useEffect, useState, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";
import { BrandMark, usePageMeta } from "@/components/SiteLayout";

type LinkItem = { platform: string; url: string; isPublic: boolean };
type ArtistLink = LinkItem & {
  kind: "streaming" | "social" | "video" | "other";
};
type ReleaseCheck =
  | "rights"
  | "metadata"
  | "distribution"
  | "artwork"
  | "links";
const releaseChecklist: Array<{ key: ReleaseCheck; label: string }> = [
  {
    key: "rights",
    label:
      "Rights and permissions are confirmed; any exception is in a separate written agreement.",
  },
  {
    key: "metadata",
    label:
      "Title, artist, release date, identifiers and label credit are verified against source records.",
  },
  {
    key: "distribution",
    label:
      "Actual distributor and pending, scheduled, live or taken-down status are verified.",
  },
  {
    key: "artwork",
    label:
      "Approved release artwork is supplied; no placeholder artwork will be published.",
  },
  {
    key: "links",
    label:
      "Every public destination is verified; missing destinations remain omitted.",
  },
];
const emptyRelease = (artistId = 0) => ({
  id: undefined as number | undefined,
  artistId,
  slug: "",
  title: "",
  releaseType: "single" as "single" | "ep" | "album",
  releaseDate: "",
  genres: "Electronic",
  description: "",
  coverUrl: "",
  coverKey: "",
  publicationStatus: "draft" as "draft" | "published",
  distributionStatus: "pending" as
    | "pending"
    | "scheduled"
    | "live"
    | "taken_down",
  featured: false,
  isrc: "",
  upcEan: "",
  distributorName: "",
  deliveryReference: "",
  labelCredit: "",
  masterOwnershipNotes: "",
  internalNotes: "",
  audioMasterKey: "",
  officialVideoUrl: "",
  linksText: "",
});
const safeLines = (text: string): LinkItem[] =>
  text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [platform, url, visibility] = line
        .split("|")
        .map(part => part.trim());
      return {
        platform: platform || "Other",
        url: url || "",
        isPublic: visibility?.toLowerCase() === "public",
      };
    });
const linkText = (
  links: Array<{ platform: string; url: string; isPublic: boolean }> = []
) =>
  links
    .map(
      link =>
        `${link.platform}|${link.url}|${link.isPublic ? "public" : "private"}`
    )
    .join("\n");

export default function Admin() {
  const {
    data: user,
    isLoading: authLoading,
    error: authError,
  } = trpc.auth.me.useQuery();
  const isAdmin = user?.role === "admin";
  const { data, isLoading, refetch } = trpc.admin.overview.useQuery(undefined, {
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });
  const [tab, setTab] = useState<"releases" | "artists" | "site" | "inbox">(
    "releases"
  );
  const [form, setForm] = useState(emptyRelease());
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [siteForm, setSiteForm] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [releaseChecks, setReleaseChecks] = useState<
    Record<ReleaseCheck, boolean>
  >({
    rights: false,
    metadata: false,
    distribution: false,
    artwork: false,
    links: false,
  });
  const [status, setStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminLoginPending, setAdminLoginPending] = useState(false);
  const utils = trpc.useUtils();
  const adminLogin = trpc.auth.adminLogin.useMutation({
    onSuccess: async () => {
      setAdminLoginError("");
      await utils.auth.me.invalidate();
    },
    onError: error => setAdminLoginError(error.message),
    onSettled: () => setAdminLoginPending(false),
  });
  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
    },
  });
  const saveRelease = trpc.admin.saveRelease.useMutation({
    onSuccess: async () => {
      setStatus("Release saved to the catalogue.");
      setFormError("");
      await refetch();
    },
  });
  const removeRelease = trpc.admin.deleteRelease.useMutation({
    onSuccess: async () => {
      setStatus("Release deleted.");
      await refetch();
    },
  });
  const saveArtist = trpc.admin.saveArtist.useMutation({
    onSuccess: async () => {
      setStatus("Artist profile saved.");
      setSelectedArtist(null);
      await refetch();
    },
  });
  const saveSettings = trpc.admin.saveSettings.useMutation({
    onSuccess: async () => {
      setStatus("Label settings saved.");
      await refetch();
      await utils.content.invalidate();
    },
  });
  const updateMessage = trpc.admin.updateContactStatus.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  const upload = trpc.admin.uploadArtwork.useMutation();
  usePageMeta("Admin — MONTYX RECORDS", "Private label administration.");
  useEffect(() => {
    let tag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "robots";
      document.head.appendChild(tag);
    }
    tag.content = "noindex,nofollow";
    return () => {
      tag?.remove();
    };
  }, []);
  useEffect(() => {
    if (data?.settings) setSiteForm({ ...data.settings });
  }, [data?.settings]);
  useEffect(() => {
    if (!form.artistId && data?.artists?.[0]?.id)
      setForm(current => ({ ...current, artistId: data.artists[0].id }));
  }, [form.artistId, data?.artists]);

  if (authLoading)
    return (
      <main className="admin-screen">
        <div className="admin-top">
          <BrandMark />
        </div>
        <div className="admin-auth-card">
          <span className="eyebrow red">PRIVATE LABEL AREA</span>
          <h1>Checking access…</h1>
        </div>
      </main>
    );
  if (!user)
    return (
      <main className="admin-screen">
        <div className="admin-top">
          <BrandMark />
        </div>
        <section className="admin-auth-card">
          <span className="eyebrow red">PRIVATE LABEL AREA</span>
          <h1>Admin access</h1>
          <p>Sign in with the private label administrator account.</p>
          {authError && (
            <div className="notice notice-error">
              Sign-in status could not be checked.
            </div>
          )}
          <form
            className="admin-form"
            onSubmit={event => {
              event.preventDefault();
              const values = new FormData(event.currentTarget);
              setAdminLoginPending(true);
              adminLogin.mutate({
                username: String(values.get("username") ?? ""),
                password: String(values.get("password") ?? ""),
              });
            }}
          >
            <label>
              Administrator username
              <input name="username" autoComplete="username" required />
            </label>
            <label>
              Administrator password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            {adminLoginError && (
              <div className="notice notice-error" role="alert">
                {adminLoginError}
              </div>
            )}
            <button
              className="button button-primary"
              disabled={adminLoginPending}
            >
              {adminLoginPending ? "Signing in…" : "Sign in as administrator"}
            </button>
          </form>
          <a className="admin-back" href="/">
            ← Return to the label site
          </a>
        </section>
      </main>
    );
  if (!isAdmin)
    return (
      <main className="admin-screen">
        <div className="admin-top">
          <BrandMark />
        </div>
        <section className="admin-auth-card">
          <span className="eyebrow red">ACCESS RESTRICTED</span>
          <h1>Not an administrator.</h1>
          <p>
            This account is authenticated, but it does not have the label’s
            admin role. No self-service role escalation is available.
          </p>
          <div className="setup-note">
            <b>First administrator setup</b>
            <p>
              From the project owner’s secure terminal, follow the first-admin
              instructions in `README.md`. Never share your OAuth identity or
              credentials in a public form.
            </p>
          </div>
          <button
            className="button button-outline"
            onClick={() => logout.mutate()}
          >
            Sign out
          </button>
          <a className="admin-back" href="/">
            ← Return to the label site
          </a>
        </section>
      </main>
    );

  const startNewRelease = () => {
    setForm(emptyRelease(data?.artists?.[0]?.id ?? 0));
    setShowPreview(false);
    setReleaseChecks({
      rights: false,
      metadata: false,
      distribution: false,
      artwork: false,
      links: false,
    });
    setStatus("");
    setFormError("");
  };
  const editRelease = (release: any) => {
    setForm({
      ...release,
      releaseDate: release.releaseDate ?? "",
      genres: (release.genres ?? []).join(", "),
      linksText: linkText(release.links ?? []),
    });
    setShowPreview(false);
    setReleaseChecks({
      rights: false,
      metadata: false,
      distribution: false,
      artwork: false,
      links: false,
    });
    setStatus("");
    setFormError("");
  };
  async function submitRelease(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    if (form.publicationStatus === "published") {
      const unchecked = releaseChecklist.filter(
        item => !releaseChecks[item.key]
      );
      if (unchecked.length) {
        setFormError(
          `Complete the internal release checklist before publishing: ${unchecked.map(item => item.key).join(", ")}.`
        );
        return;
      }
      if (
        !form.releaseDate ||
        !form.coverUrl.trim() ||
        !form.labelCredit.trim()
      ) {
        setFormError(
          "A published release needs a verified date, approved artwork and confirmed label credit."
        );
        return;
      }
      if (
        form.distributionStatus !== "pending" &&
        !form.distributorName.trim()
      ) {
        setFormError(
          "Enter the actual distributor before publishing a scheduled, live or taken-down release."
        );
        return;
      }
      if (
        !window.confirm(
          "Publish this release publicly? Confirm that the title, date, cover, label credit, rights, distributor status and every public link are verified."
        )
      )
        return;
    }
    const { linksText, genres, ...fields } = form;
    const date = fields.releaseDate ? fields.releaseDate : null;
    try {
      await saveRelease.mutateAsync({
        ...fields,
        releaseDate: date,
        genres: genres
          .split(",")
          .map(item => item.trim())
          .filter(Boolean),
        officialVideoUrl: fields.officialVideoUrl,
        releaseChecklist: releaseChecklist
          .filter(item => releaseChecks[item.key])
          .map(item => item.key),
        links: safeLines(linksText),
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Release could not be saved."
      );
    }
  }
  async function handleArtwork(file?: File) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setFormError("Artwork must be 3 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result ?? "");
      const dataBase64 = dataUrl.split(",")[1] ?? "";
      try {
        const result = await upload.mutateAsync({
          fileName: file.name,
          contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
          dataBase64,
        });
        setForm(current => ({
          ...current,
          coverUrl: result.url,
          coverKey: result.key,
        }));
        setStatus(
          "Artwork uploaded to private Supabase Storage. Save the release to link it."
        );
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Artwork upload failed."
        );
      }
    };
    reader.readAsDataURL(file);
  }
  function submitArtist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedArtist) return;
    const formData = new FormData(event.currentTarget);
    const links: ArtistLink[] = String(formData.get("links") ?? "")
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [platform, kind, url, visibility] = line
          .split("|")
          .map(item => item.trim());
        return {
          platform: platform || "Other",
          kind: (kind || "social") as ArtistLink["kind"],
          url: url || "",
          isPublic: visibility?.toLowerCase() === "public",
        };
      });
    saveArtist.mutate({
      id: selectedArtist.id,
      name: String(formData.get("name")),
      slug: String(formData.get("slug")),
      biography: String(formData.get("biography")),
      genres: String(formData.get("genres"))
        .split(",")
        .map(item => item.trim())
        .filter(Boolean),
      photoUrl: String(formData.get("photoUrl")),
      isPublic: formData.get("isPublic") === "on",
      links,
    });
  }

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <BrandMark />
        <div className="admin-user">
          <span>{user.name || user.email || "Authorized administrator"}</span>
          <button onClick={() => logout.mutate()}>Log out</button>
          <a href="/" aria-label="Open public website">
            View site ↗
          </a>
        </div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <span className="eyebrow">LABEL CONTROL</span>
          <h1>Dashboard</h1>
          <nav aria-label="Admin sections">
            {(
              [
                ["releases", "Releases"],
                ["artists", "Artists"],
                ["site", "Label settings"],
                ["inbox", "Contact inbox"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                className={tab === key ? "admin-tab active" : "admin-tab"}
                onClick={() => {
                  setTab(key);
                  setStatus("");
                }}
              >
                {label}
                {key === "inbox" &&
                data?.messages?.filter(
                  (message: any) => message.status === "new"
                ).length ? (
                  <span className="inbox-count">
                    {
                      data.messages.filter(
                        (message: any) => message.status === "new"
                      ).length
                    }
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
          <div className="admin-privacy">
            <span className="eyebrow">PRIVATE BY DEFAULT</span>
            <p>
              Drafts and internal release notes are never shown on public pages.
            </p>
          </div>
        </aside>
        <section className="admin-main">
          {status && (
            <div className="notice notice-success" role="status">
              {status}
            </div>
          )}
          {formError && (
            <div className="notice notice-error" role="alert">
              {formError}
            </div>
          )}
          {isLoading && <p className="muted">Loading label data…</p>}
          {tab === "releases" && (
            <>
              <div className="admin-section-head">
                <div>
                  <span className="eyebrow red">CATALOGUE MANAGEMENT</span>
                  <h2>Releases</h2>
                  <p>
                    Drafts stay private until an authorized administrator
                    publishes them.
                  </p>
                </div>
                <button
                  className="button button-primary"
                  onClick={startNewRelease}
                >
                  + Add release
                </button>
              </div>
              <div className="admin-release-list">
                {data?.releases.map((item: any) => (
                  <article className="admin-release-row" key={item.id}>
                    <div className="admin-release-thumb">
                      {item.coverUrl ? (
                        <img src={item.coverUrl} alt="" />
                      ) : (
                        <span>MX</span>
                      )}
                    </div>
                    <div className="admin-release-info">
                      <b>{item.title}</b>
                      <span>
                        {item.releaseType.toUpperCase()} ·{" "}
                        {item.releaseDate || "Date not set"} ·{" "}
                        {item.publicationStatus.toUpperCase()}
                      </span>
                    </div>
                    <span
                      className={`status-pill status-${item.distributionStatus}`}
                    >
                      {item.distributionStatus.replace("_", " ")}
                    </span>
                    <button
                      className="button button-small button-outline"
                      onClick={() => editRelease(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="button button-small button-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete “${item.title}”? This removes the release and its platform links.`
                          )
                        )
                          removeRelease.mutate({ id: item.id });
                      }}
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
              <form
                className="admin-form release-editor"
                onSubmit={submitRelease}
              >
                <div
                  className="release-checklist"
                  aria-label="Internal release verification checklist"
                >
                  <span className="eyebrow red">
                    INTERNAL RELEASE CHECKLIST · REQUIRED TO PUBLISH
                  </span>
                  {releaseChecklist.map(item => (
                    <label key={item.key}>
                      <input
                        type="checkbox"
                        checked={releaseChecks[item.key]}
                        onChange={event =>
                          setReleaseChecks(current => ({
                            ...current,
                            [item.key]: event.target.checked,
                          }))
                        }
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
                <div className="form-title-row">
                  <div>
                    <span className="eyebrow">
                      {form.id
                        ? `EDIT RELEASE #${form.id}`
                        : "NEW RELEASE / DRAFT"}
                    </span>
                    <h3>
                      {form.id
                        ? form.title || "Untitled release"
                        : "Release details"}
                    </h3>
                  </div>
                  {form.id && (
                    <button
                      type="button"
                      className="button button-small button-outline"
                      onClick={startNewRelease}
                    >
                      New release
                    </button>
                  )}
                </div>
                <div className="form-grid">
                  <label>
                    Title
                    <input
                      required
                      maxLength={200}
                      value={form.title}
                      onChange={event =>
                        setForm({ ...form, title: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Artist
                    <select
                      required
                      value={form.artistId || ""}
                      onChange={event =>
                        setForm({
                          ...form,
                          artistId: Number(event.target.value),
                        })
                      }
                    >
                      {data?.artists.map((artist: any) => (
                        <option key={artist.id} value={artist.id}>
                          {artist.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Slug
                    <input
                      required
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      value={form.slug}
                      onChange={event =>
                        setForm({ ...form, slug: event.target.value })
                      }
                      placeholder="release-title"
                    />
                  </label>
                  <label>
                    Release type
                    <select
                      value={form.releaseType}
                      onChange={event =>
                        setForm({
                          ...form,
                          releaseType: event.target
                            .value as typeof form.releaseType,
                        })
                      }
                    >
                      <option value="single">Single</option>
                      <option value="ep">EP</option>
                      <option value="album">Album</option>
                    </select>
                  </label>
                  <label>
                    Release date
                    <input
                      type="date"
                      value={form.releaseDate}
                      onChange={event =>
                        setForm({ ...form, releaseDate: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Genres, comma-separated
                    <input
                      value={form.genres}
                      onChange={event =>
                        setForm({ ...form, genres: event.target.value })
                      }
                      placeholder="Electronic, Phonk"
                    />
                  </label>
                  <label className="span-two">
                    Public description
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={event =>
                        setForm({ ...form, description: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Publication
                    <select
                      value={form.publicationStatus}
                      onChange={event =>
                        setForm({
                          ...form,
                          publicationStatus: event.target
                            .value as typeof form.publicationStatus,
                        })
                      }
                    >
                      <option value="draft">Draft — private</option>
                      <option value="published">Published — public</option>
                    </select>
                  </label>
                  <label>
                    Distribution status
                    <select
                      value={form.distributionStatus}
                      onChange={event =>
                        setForm({
                          ...form,
                          distributionStatus: event.target
                            .value as typeof form.distributionStatus,
                        })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live — confirmed</option>
                      <option value="taken_down">Taken down</option>
                    </select>
                  </label>
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={event =>
                        setForm({ ...form, featured: event.target.checked })
                      }
                    />{" "}
                    Feature on homepage
                  </label>
                  <label>
                    ISRC (internal)
                    <input
                      value={form.isrc}
                      onChange={event =>
                        setForm({ ...form, isrc: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    UPC/EAN (internal)
                    <input
                      value={form.upcEan}
                      onChange={event =>
                        setForm({ ...form, upcEan: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Distributor name
                    <input
                      value={form.distributorName}
                      onChange={event =>
                        setForm({
                          ...form,
                          distributorName: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Delivery reference
                    <input
                      value={form.deliveryReference}
                      onChange={event =>
                        setForm({
                          ...form,
                          deliveryReference: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Label credit
                    <input
                      value={form.labelCredit}
                      onChange={event =>
                        setForm({ ...form, labelCredit: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Official video URL (HTTPS)
                    <input
                      type="url"
                      value={form.officialVideoUrl}
                      onChange={event =>
                        setForm({
                          ...form,
                          officialVideoUrl: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="span-two">
                    Master ownership notes — internal
                    <textarea
                      rows={2}
                      value={form.masterOwnershipNotes}
                      onChange={event =>
                        setForm({
                          ...form,
                          masterOwnershipNotes: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="span-two">
                    Internal delivery notes — never public
                    <textarea
                      rows={3}
                      value={form.internalNotes}
                      onChange={event =>
                        setForm({ ...form, internalNotes: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Audio master storage key (internal)
                    <input
                      value={form.audioMasterKey}
                      onChange={event =>
                        setForm({ ...form, audioMasterKey: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Artwork URL
                    <input
                      value={form.coverUrl}
                      onChange={event =>
                        setForm({ ...form, coverUrl: event.target.value })
                      }
                      placeholder="Upload or enter HTTPS artwork URL"
                    />
                    <small className="muted small-note">
                      The initial release has no verified cover artwork. Upload
                      an approved cover before publishing.
                    </small>
                  </label>
                  <label className="file-field">
                    Upload artwork{" "}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={event =>
                        void handleArtwork(event.target.files?.[0])
                      }
                    />
                    {upload.isPending && <span>Uploading securely…</span>}
                  </label>
                  <label className="span-two">
                    Streaming destinations — one per line:
                    `platform|https://url|public` or `private`
                    <textarea
                      rows={4}
                      value={form.linksText}
                      onChange={event =>
                        setForm({ ...form, linksText: event.target.value })
                      }
                      placeholder="Spotify|https://...|public"
                    />
                  </label>
                </div>
                {showPreview && (
                  <section
                    className="release-preview"
                    aria-label="Private release preview"
                  >
                    <span className="eyebrow red">
                      PRIVATE PREVIEW · NOT PUBLISHED
                    </span>
                    <div className="release-preview-grid">
                      <div className="release-preview-art">
                        {form.coverUrl ? (
                          <img
                            src={form.coverUrl}
                            alt="Release cover preview"
                          />
                        ) : (
                          <BrandMark compact />
                        )}
                      </div>
                      <div>
                        <span className="eyebrow">
                          {form.releaseType.toUpperCase()} ·{" "}
                          {form.releaseDate || "DATE TO BE CONFIRMED"} ·{" "}
                          {form.distributionStatus
                            .replace("_", " ")
                            .toUpperCase()}
                        </span>
                        <h3>{form.title || "Untitled release"}</h3>
                        <p>
                          {data?.artists.find(
                            (artist: any) => artist.id === form.artistId
                          )?.name ?? "MONTYX"}{" "}
                          · {form.genres || "Genre to be confirmed"}
                        </p>
                        {form.description && <p>{form.description}</p>}
                        <p>
                          {safeLines(form.linksText)
                            .filter(
                              link =>
                                link.isPublic && /^https:\/\//i.test(link.url)
                            )
                            .map(link => link.platform)
                            .join(" · ") ||
                            "No confirmed public listening links"}
                        </p>
                      </div>
                    </div>
                  </section>
                )}
                <div className="editor-footer">
                  <p>
                    Only public links for published releases appear on the site.
                    Internal identifiers and notes remain private.
                  </p>
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setShowPreview(value => !value)}
                  >
                    {showPreview ? "Hide preview" : "Preview release"}
                  </button>
                  <button
                    disabled={saveRelease.isPending || upload.isPending}
                    className="button button-primary"
                  >
                    {saveRelease.isPending
                      ? "Saving…"
                      : form.id
                        ? "Save changes"
                        : "Save draft"}{" "}
                    <span>↗</span>
                  </button>
                </div>
              </form>
            </>
          )}
          {tab === "artists" && (
            <>
              <div className="admin-section-head">
                <div>
                  <span className="eyebrow red">PROFILE MANAGEMENT</span>
                  <h2>Artists</h2>
                  <p>
                    Maintain artist biographies, genres, profile image
                    references and verified links.
                  </p>
                </div>
                <button
                  className="button button-primary"
                  onClick={() =>
                    setSelectedArtist({
                      name: "",
                      slug: "",
                      biography: "",
                      genres: [],
                      photoUrl: "",
                      isPublic: false,
                      links: [],
                    })
                  }
                >
                  + Add artist
                </button>
              </div>
              <div className="admin-release-list">
                {data?.artists.map((artist: any) => (
                  <article className="admin-release-row" key={artist.id}>
                    <div className="admin-release-thumb">
                      {artist.photoUrl ? (
                        <img src={artist.photoUrl} alt="" />
                      ) : (
                        <span>MX</span>
                      )}
                    </div>
                    <div className="admin-release-info">
                      <b>{artist.name}</b>
                      <span>
                        /{artist.slug} ·{" "}
                        {artist.isPublic ? "PUBLIC" : "PRIVATE"} ·{" "}
                        {(artist.genres ?? []).join(", ")}
                      </span>
                    </div>
                    <button
                      className="button button-small button-outline"
                      onClick={() => setSelectedArtist(artist)}
                    >
                      Edit profile
                    </button>
                  </article>
                ))}
              </div>
              {selectedArtist && (
                <form className="admin-form" onSubmit={submitArtist}>
                  <div className="form-title-row">
                    <div>
                      <span className="eyebrow">ARTIST PROFILE</span>
                      <h3>{selectedArtist.name || "New artist"}</h3>
                    </div>
                    <button
                      type="button"
                      className="button button-small button-outline"
                      onClick={() => setSelectedArtist(null)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="form-grid">
                    <label>
                      Name
                      <input
                        name="name"
                        required
                        defaultValue={selectedArtist.name}
                      />
                    </label>
                    <label>
                      Slug
                      <input
                        name="slug"
                        required
                        defaultValue={selectedArtist.slug}
                        placeholder="artist-name"
                      />
                    </label>
                    <label>
                      Genres
                      <input
                        name="genres"
                        defaultValue={(selectedArtist.genres ?? []).join(", ")}
                      />
                    </label>
                    <label>
                      Profile image URL
                      <input
                        name="photoUrl"
                        defaultValue={selectedArtist.photoUrl ?? ""}
                      />
                      <small className="muted small-note">
                        No verified profile photo has been supplied yet; add one
                        only after the owner approves it.
                      </small>
                    </label>
                    <label className="span-two">
                      Biography
                      <textarea
                        name="biography"
                        rows={5}
                        defaultValue={selectedArtist.biography}
                      />
                    </label>
                    <label className="check-field">
                      <input
                        type="checkbox"
                        name="isPublic"
                        defaultChecked={selectedArtist.isPublic}
                      />{" "}
                      Public profile
                    </label>
                    <label className="span-two">
                      Links, one per line: `platform|kind|https://url|public`
                      <textarea
                        name="links"
                        rows={4}
                        defaultValue={(selectedArtist.links ?? [])
                          .map(
                            (link: any) =>
                              `${link.platform}|${link.kind}|${link.url}|${link.isPublic ? "public" : "private"}`
                          )
                          .join("\n")}
                        placeholder="Instagram|social|https://...|public"
                      />
                    </label>
                  </div>
                  <div className="editor-footer">
                    <p>
                      Only links marked public and confirmed by the label appear
                      on the artist page.
                    </p>
                    <button
                      className="button button-primary"
                      disabled={saveArtist.isPending}
                    >
                      Save artist profile ↗
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
          {tab === "site" && (
            <>
              <div className="admin-section-head">
                <div>
                  <span className="eyebrow red">PUBLIC IDENTITY</span>
                  <h2>Label settings</h2>
                  <p>
                    These fields update the public site. Leave contact/social
                    addresses empty until they are verified.
                  </p>
                </div>
              </div>
              <form
                className="admin-form"
                onSubmit={event => {
                  event.preventDefault();
                  saveSettings.mutate(siteForm);
                }}
              >
                <div className="form-grid">
                  {[
                    ["labelName", "Label name"],
                    ["homeHeadline", "Homepage headline"],
                    ["homeSubhead", "Homepage supporting line"],
                    ["contactEmail", "Contact email — optional"],
                    ["spotifyUrl", "Spotify profile URL"],
                    ["youtubeUrl", "YouTube profile URL"],
                    ["soundcloudUrl", "SoundCloud profile URL"],
                    ["tiktokUrl", "TikTok profile URL"],
                    ["instagramUrl", "Instagram profile URL"],
                  ].map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        value={siteForm[key] ?? ""}
                        onChange={event =>
                          setSiteForm({
                            ...siteForm,
                            [key]: event.target.value,
                          })
                        }
                      />
                    </label>
                  ))}
                  <label className="span-two">
                    Label introduction
                    <textarea
                      rows={4}
                      value={siteForm.labelIntro ?? ""}
                      onChange={event =>
                        setSiteForm({
                          ...siteForm,
                          labelIntro: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <div className="editor-footer">
                  <p>
                    Only real configured destinations are rendered as public
                    links.
                  </p>
                  <button
                    className="button button-primary"
                    disabled={saveSettings.isPending}
                  >
                    Save label settings ↗
                  </button>
                </div>
              </form>
            </>
          )}
          {tab === "inbox" && (
            <>
              <div className="admin-section-head">
                <div>
                  <span className="eyebrow red">PRIVATE MESSAGES</span>
                  <h2>Contact inbox</h2>
                  <p>
                    Submissions are stored here. Email forwarding is not
                    configured.
                  </p>
                </div>
              </div>
              {data?.messages.length ? (
                <div className="inbox-list">
                  {data.messages.map((message: any) => (
                    <article className="inbox-card" key={message.id}>
                      <div className="inbox-head">
                        <div>
                          <span className="eyebrow">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                          <h3>{message.subject}</h3>
                        </div>
                        <select
                          aria-label={`Update status for ${message.subject}`}
                          value={message.status}
                          onChange={event =>
                            updateMessage.mutate({
                              id: message.id,
                              status: event.target.value as
                                | "new"
                                | "in_review"
                                | "resolved",
                            })
                          }
                        >
                          <option value="new">New</option>
                          <option value="in_review">In review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <p className="inbox-sender">
                        {message.name} ·{" "}
                        <a href={`mailto:${message.email}`}>{message.email}</a>
                      </p>
                      <p>{message.message}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-catalogue">
                  <span className="eyebrow">INBOX EMPTY</span>
                  <p>New contact form messages will appear here.</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
