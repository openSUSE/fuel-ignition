npm run build
cp dist/index.html dist/404.html
cp README.md dist/README.md
git branch -D gh-pages
git push origin --delete gh-pages
git branch gh-pages
git checkout gh-pages
git add dist/ -f
git add dist/404.html
git commit -m "feat(GitHub Pages): deploy latest change"
git subtree push --prefix dist origin gh-pages
git checkout main
