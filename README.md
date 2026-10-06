# leonarpro68-cmd.github.io

Personal portfolio — static HTML/CSS/JS, no build step.

## Publish on GitHub Pages

1. Create a **public** repo named exactly `leonarpro68-cmd.github.io`.
2. Upload everything in this folder to the root of the repo (`index.html` must be at the root).
3. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
4. After ~1 min the site is live at https://leonarpro68-cmd.github.io

## Structure

```
index.html              home
projects/index.html     project list (one <a class="frame project-row"> card per project)
projects/<slug>.html    one page per project
cv/index.html           CV
css/style.css           colors at the top (:root = light, [data-theme="dark"] = dark)
assets/img/projects/    images (.webp/.jpg)
assets/video/           videos (.mp4 H.264, ideally < 10 MB)
```

## Add a project

1. Copy `projects/armcar.html` → `projects/new.html` and edit the text.
2. Copy one card in `projects/index.html` and point it to `new.html`.
3. Put images in `assets/img/projects/`. Remove the `<div class="todo">` boxes once you add real media.

Compress a video before uploading:
`ffmpeg -i in.mp4 -vf scale=-2:720 -c:v libx264 -crf 27 -movflags +faststart out.mp4`
