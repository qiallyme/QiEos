# Converting to Git Submodules

This guide shows how to convert the current monorepo structure to true Git submodules.

## Current State
- `miniapps/` is just a directory containing miniapp folders
- All code is in one repository
- No true separation between projects

## Target State
- Each miniapp becomes its own Git repository
- Main repository uses Git submodules to reference them
- True separation and independent versioning

## Step 1: Create Separate Repositories

### For Qivect-Dropbox
```bash
# Create new repository for qivect-dropbox
mkdir qivect-dropbox-repo
cd qivect-dropbox-repo
git init
cp -r ../miniapps/qivect-dropbox/* .
git add .
git commit -m "Initial commit: qivect-dropbox miniapp"
# Push to GitHub/GitLab as separate repository
```

### For Qi RAG Private
```bash
# Create new repository for qi_rag_private
mkdir qi_rag_private-repo
cd qi_rag_private-repo
git init
cp -r ../miniapps/qi_rag_private/* .
git add .
git commit -m "Initial commit: qi_rag_private miniapp"
# Push to GitHub/GitLab as separate repository
```

## Step 2: Add as Submodules

```bash
# Remove current miniapps directory
rm -rf miniapps/

# Add as submodules
git submodule add https://github.com/your-org/qivect-dropbox.git miniapps/qivect-dropbox
git submodule add https://github.com/your-org/qi_rag_private.git miniapps/qi_rag_private

# Commit the submodule additions
git add .
git commit -m "Add miniapps as submodules"
```

## Step 3: Update .gitmodules

The `.gitmodules` file will be created automatically:

```ini
[submodule "miniapps/qivect-dropbox"]
    path = miniapps/qivect-dropbox
    url = https://github.com/your-org/qivect-dropbox.git

[submodule "miniapps/qi_rag_private"]
    path = miniapps/qi_rag_private
    url = https://github.com/your-org/qi_rag_private.git
```

## Step 4: Working with Submodules

### Clone the main repository with submodules
```bash
git clone --recursive https://github.com/your-org/QiLife-Eos.git
```

### Or clone and then update submodules
```bash
git clone https://github.com/your-org/QiLife-Eos.git
cd QiLife-Eos
git submodule update --init --recursive
```

### Update submodules to latest versions
```bash
git submodule update --remote
```

### Make changes in a submodule
```bash
cd miniapps/qivect-dropbox
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Update main repository to point to new submodule commit
cd ../..
git add miniapps/qivect-dropbox
git commit -m "Update qivect-dropbox submodule"
```

## Benefits of Submodules

1. **Independent Versioning**: Each miniapp has its own version history
2. **Separate Access Control**: Different teams can manage different miniapps
3. **Independent Deployment**: Each miniapp can be deployed separately
4. **Cleaner History**: Main repo history focuses on orchestration changes
5. **Reusability**: Miniapps can be used in other projects

## Drawbacks of Submodules

1. **Complexity**: More complex Git operations
2. **Learning Curve**: Team needs to understand submodule workflow
3. **Sync Issues**: Easy to get out of sync between main repo and submodules

## Alternative: Keep Current Structure

If submodules are too complex, you can keep the current monorepo structure and just improve the documentation and tooling. Many successful projects use this approach.

## Recommendation

For a small team or initial development, the current monorepo structure is actually fine. Consider submodules only when:
- You have multiple teams working on different miniapps
- You need independent versioning and deployment
- You want to reuse miniapps in other projects
