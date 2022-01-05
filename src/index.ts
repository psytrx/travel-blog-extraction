import { copyFile, readdir, readFile, writeFile } from "fs/promises";
import { HTMLElement, parse, TextNode } from "node-html-parser";
import rimraf from "rimraf";

type PostContentTextBlock = {
  kind: "text-block";
  content: string;
};
type PostContentImageGallery = {
  kind: "image-gallery";
  images: string[];
};
type PostContent = PostContentTextBlock | PostContentImageGallery;

interface Post {
  slug: string;
  title: string;
  date: string;
  image: string;
  description: string;
  content: PostContent[];
}

const decodeHtml = (s: string) => {
  return s.replace("&#x27;", "'");
};

const main = async () => {
  const baseDir = "data/blog";

  const allFiles = await readdir(baseDir);
  const htmlFiles = allFiles.filter(
    (file) => file.endsWith(".html") && !file.startsWith("_")
  );

  const convertPromises = await Promise.all(
    htmlFiles.map(async (file) => {
      const filepath = `${baseDir}/${file}`;
      const rawHtml = await readFile(filepath, "utf8");
      const parsedHtml = parse(rawHtml);

      const ld = parsedHtml
        .querySelectorAll("script[type='application/ld+json']")
        .map((script) => JSON.parse(script.rawText))
        .find((ld) => ld["@type"] === "Article");

      if (!ld) {
        throw new Error(`No ld+json element found in ${filepath}`);
      }

      const contentBody = parsedHtml.querySelector(".post-content-body");
      if (!contentBody) {
        throw new Error(`No post-content-body element found in ${filepath}`);
      }

      const contents: PostContent[] = [];
      contentBody.childNodes.forEach((node) => {
        if (node instanceof TextNode) return;

        if (node instanceof HTMLElement) {
          if (node.rawTagName === "p") {
            return contents.push({
              kind: "text-block",
              content: decodeHtml(node.text),
            });
          }

          if (node.rawTagName === "figure") {
            const imgs = node.querySelectorAll("img");
            const imgUrls = imgs.map(
              (img) =>
                (img.getAttribute("src") as string).split("/").pop() as string
            );
            return contents.push({
              kind: "image-gallery",
              images: imgUrls,
            });
          }
        }

        console.log(node);
        throw new Error("Could not convert post content body node");
      });

      return {
        ld,
        contents,
      };
    })
  );

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .replace("ä", "ae")
      .replace("ö", "oe")
      .replace("ü", "ue")
      .replace("ß", "ss")
      .replace("'", "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const posts: Post[] = convertPromises.map((post, i) => {
    const title = decodeHtml(post.ld.headline);
    const slug = slugify(title);
    const image = post.ld.image.url.split("/").pop();
    const description = decodeHtml(post.ld.description);

    return {
      // ...post,
      slug,
      title,
      date: post.ld.datePublished,
      image,
      description,
      content: post.contents,
    };
  });
  posts.sort((a, b) => b.date.localeCompare(a.date));

  const json = JSON.stringify(posts, null, 2);
  await writeFile("output/data.json", json);

  console.log("data.json export successful");

  await new Promise((resolve) => rimraf("output/img/*", resolve));
  console.log("deleted old image files output");

  posts.forEach(async (post) => {
    const path = `data/blog/${post.title}_files/${post.image}`;
    await copyFile(path, `output/img/${post.image}`);

    post.content
      .filter((c) => c.kind === "image-gallery")
      .forEach((gallery) => {
        if (gallery.kind === "image-gallery") {
          gallery.images.forEach(async (img) => {
            const path = `data/blog/${post.title}_files/${img}`;
            await copyFile(path, `output/img/${img}`);
          });
        }
      });
  });

  console.log("image files export successful");
};

main();
