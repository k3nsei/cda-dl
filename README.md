# cda-dl

Utility tool to download video files from CDA

## How to use

### Download video:

```bash
npx cda-dl https://www.cda.pl/video/{videoId}
```

Downloaded video files would be stored at `./videos/{videoId}.mp4`

### Download video and specify output path:

```bash
npx cda-dl https://www.cda.pl/video/{videoId} -o "my-video.mp4"
```

Downloaded video files would be stored at `./my-video.mp4`
