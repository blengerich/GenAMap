The Documentation on the Git website is really readable and helpful.

### Add file (adds to your local repo)
	git add file.txt

### Commit file (commit to your local repo)
	git commit file.txt
 	
### Push file (push to remote repo)
	git push origin master

### Branching Strategy and merging changes back into master
	Create a new branch
	git checkout -b branchName
	Do some work on the branch

### Important: Update branch regularly with stuff in master if master changes regularly
	git checkout master
	git pull origin master
	git checkout branchName
	git merge master

### If everything is working, you can commit and push your branch
	git checkout branchName
	git add .
	git commit -m “Message on what you changed”
	git push origin branchName

### Code review & merging onto master
go to github, create the pull request for your published branch

Then merge with master & delete your branch

	git checkout master
	git pull origin master
	git merge branchName
	git push origin master
	git push origin :branchName		// delete remote branch
	git branch -d branchName	// to delete branch locally

When you have a **merge conflict**, open the file up in an editor and manually fix the merge then do
	git add lib/hello.html
	git commit -m "Merged master fixed conflict."


###Change name of your branch with: 
	git branch -m newname

###Relevant:
[http://spring.io/blog/2010/12/21/git-and-social-coding-how-to-merge-without-fear
](http://spring.io/blog/2010/12/21/git-and-social-coding-how-to-merge-without-fear)


