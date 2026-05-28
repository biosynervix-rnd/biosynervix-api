# 1. Check which files Git is tracking (you shouldn't see server.js or package.json here if they're missing)
git ls-files

# 2. Add the missing files explicitly
git add server.js package.json

# 3. Check the status to confirm they are added (they should appear in green)
git status

# 4. Commit the added files
git commit -m "Add server.js and package.json"

# 5. Push the new commit to GitHub
git push origin main
