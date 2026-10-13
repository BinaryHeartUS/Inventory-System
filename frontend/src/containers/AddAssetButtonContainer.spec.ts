import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AddAssetProvider } from "../context/AddAssetContext";
import { AuthContext } from "../context/AuthContext";
import { ChapterContext } from "../context/ChapterContext";
import type { ChapterRole, ChapterSummary } from "../types/inventory";
import AddAssetButtonContainer from "./AddAssetButtonContainer";

const chapters: ChapterSummary[] = [
  { id: 1, name: "National" },
  { id: 2, name: "First Chapter" },
  { id: 3, name: "Second Chapter" },
];

function renderButton(chapterRoles: ChapterRole[], chapterList = chapters) {
  return renderToStaticMarkup(
    createElement(
      AuthContext.Provider,
      {
        value: {
          auth: {
            token: "test-token",
            username: "test-user",
            chapterRoles,
            chapterIds: chapterRoles.map((chapterRole) => chapterRole.chapterId),
            role: chapterRoles[0]?.role ?? "Viewer",
          },
          login: vi.fn(),
          logout: vi.fn(),
        },
      },
      createElement(
        ChapterContext.Provider,
        {
          value: {
            chapters: chapterList,
            chapterName: (id) => chapterList.find((chapter) => chapter.id === id)?.name ?? "",
            refreshChapters: vi.fn(),
          },
        },
        createElement(AddAssetProvider, {
          onOpen: vi.fn(),
          children: createElement(AddAssetButtonContainer),
        })
      )
    )
  );
}

describe("AddAssetButtonContainer", () => {
  it("hides the button for chapter viewers", () => {
    expect(renderButton([{ chapterId: 2, role: "Viewer" }])).toBe("");
  });

  it("hides the button for National viewers", () => {
    expect(renderButton([{ chapterId: 1, role: "Viewer" }])).toBe("");
  });

  it.each(["Editor", "Chapter Admin", "Admin"])("shows the button for a chapter %s", (role) => {
    expect(renderButton([{ chapterId: 2, role }])).toContain("Add Asset");
  });

  it("shows the button for a National viewer with write access to another chapter", () => {
    expect(
      renderButton([
        { chapterId: 1, role: "Viewer" },
        { chapterId: 3, role: "Editor" },
      ])
    ).toContain("Add Asset");
  });

  it("shows the button for a National admin", () => {
    expect(renderButton([{ chapterId: 1, role: "Admin" }])).toContain("Add Asset");
  });

  it("hides the button until a writable chapter is available", () => {
    expect(renderButton([{ chapterId: 2, role: "Editor" }], [])).toBe("");
  });

  it("hides the button when only the National meta-chapter exists", () => {
    expect(renderButton([{ chapterId: 1, role: "Admin" }], [chapters[0]])).toBe("");
  });
});
