# How to Contribute

We want your help to make the Samvera community great. There are a few guidelines
that we need contributors to follow so that we can have a chance of
keeping on top of things.

## Code of Conduct

The Samvera Community is dedicated to providing a welcoming and positive
experience for all its members, whether they are at a formal gathering, in
a social setting, or taking part in activities online. Please see our
[Code of Conduct](CODE_OF_CONDUCT.md) for more information.

## Samvera Community Intellectual Property Licensing and Ownership

All code contributors must have an Individual Contributor License Agreement
(iCLA) on file with the Samvera Steering Group. If the contributor works for
an institution, the institution must have a Corporate Contributor License
Agreement (cCLA) on file.

https://wiki.duraspace.org/display/samvera/Samvera+Community+Intellectual+Property+Licensing+and+Ownership

You should also add yourself to the `CONTRIBUTORS.md` file in the root of the project.

## Language

The language we use matters.  Today, tomorrow, and for years to come
people will read the code we write.  They will judge us for our
design, logic, and the words we use to describe the system.

Our words should be accessible.  Favor descriptive words that give
meaning while avoiding reinforcing systemic inequities.  For example,
in the Samvera community, we should favor using allowed\_list instead
of whitelist, denied\_list instead of blacklist, or source/copy
instead of master/slave.

We're going to get it wrong, but this is a call to keep working to
make it right.  View our code and the words we choose as a chance to
have a conversation. A chance to grow an understanding of the systems
we develop as well as the systems in which we live.

See [“Blacklists” and “whitelists”: a salutary warning concerning the
prevalence of racist language in discussions of predatory
publishing](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6148600/) for
further details.

## Contribution Tasks

* Reporting Issues
* Making Changes
* Documenting Code
* Committing Changes
* Submitting Changes
* Reviewing and Merging Changes

### Reporting Issues

* Make sure you have a [GitHub account](https://github.com/signup/free)
* Submit a [Github issue](https://github.com/samvera/serverless-iiif/issues/) by:
  * Clearly describing the issue
    * Provide a descriptive summary
    * Explain the expected behavior
    * Explain the actual behavior
    * Provide steps to reproduce the actual behavior

### Making Changes

* Fork the repository on GitHub
* Create a topic branch from where you want to base your work.
  * This is usually the `main` branch.
  * To quickly create a topic branch based on `main`; `git branch fix/main/my_contribution main`
  * Then checkout the new branch with `git checkout fix/main/my_contribution`.
  * Please avoid working directly on the `main` branch.
  * Please do not create a branch called `master`. (See note below.)
  * You may find the [hub suite of commands](https://github.com/defunkt/hub) helpful
* Make sure you have added sufficient tests and documentation for your changes.
  * Test functionality with Jest.
* Run _all_ the tests to assure nothing else was accidentally broken.

NOTE: This repository follows the [Samvera Community Code of Conduct](https://samvera.atlassian.net/wiki/spaces/samvera/pages/405212316/Code+of+Conduct) 
and [language recommendations](#language).  
Please ***do not*** create a branch called `master` for this repository or as part of 
your pull request; the branch will either need to be removed or renamed before it can 
be considered for inclusion in the code base and history of this repository.

#### Prerequisites

- Some basic knowledge of AWS and [CloudFormation](https://aws.amazon.com/cloudformation/)
- [Docker](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-docker.html)
- [AWS CLI](https://aws.amazon.com/cli/)
- [AWS SAM CLI](https://aws.amazon.com/serverless/sam/) v1.140.0 or greater
- The [make](https://www.gnu.org/software/make/) build tool (included with build tools on most UNIX-like operating systems)

#### Building and Deploying

The first time you run any of the build/package/publish/deploy commands, the `libvips`/`sharp` dependency layer will 
be built from source, which may take a while. But as long as you don't clear the Docker build cache (via 
`docker builder prune` or `docker system prune`), future calls should be nice and fast.

The file `deploy.yml.example` contains examples of both `deploy` and `sync` configurations for command-line
deployment and iterative development. Copy it to `deploy.yml` and modify it to suit your configuration before
running the commands below.

##### Deploying

```sh
npm run deploy
```

If you haven't created a [SAM configuration file](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-config.html) per the above instructions, you will be guided through a series of prompts to provide the correct values, and then prompted to save the configuration file at the end before the stack is deployed.

If the stack deploys successfully, make note of the `Endpoint - IIIF Endpoint URL` output. You'll need this to test the API.

##### Iterative Development

```sh
npm run dev
```

This command deploys a stack and then watches the source for changes, which are synced automatically to the stack
without all the CloudFormation overhead until you quit the watch process. This command does not have a guided
deployment option, so it relies on the `default.sync` section of the SAM configuration file.

##### Testing the API

To test the API, you'll need an identifier that exists in your source bucket. Make a request for that identifier with:

`<myapiendpoint>/<myimageidentifier>/full/full/0/default.jpg`

Replace `<myapiendpoint>` with the `Endpoint` output from the `sam deploy` command.

### Committing changes

* Make commits of logical units.
* Check for unnecessary whitespace with `git diff --check` before committing.
* Make sure your commit messages are [well formed](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
* If you created an issue, you can close it by including "Closes #issue" in your commit message. See [Github's blog post for more details](https://github.com/blog/1386-closing-issues-via-commit-messages)

```
    Present tense short summary (50 characters or less)

    More detailed description, if necessary. It should be wrapped to 72
    characters. Try to be as descriptive as you can, even if you think that
    the commit content is obvious, it may not be obvious to others. You
    should add such description also if it's already present in bug tracker,
    it should not be necessary to visit a webpage to check the history.

    Include Closes #<issue-number> when relevant.

    Description can have multiple paragraphs and you can use code examples
    inside, just indent it with 4 spaces:

        function handler(event) {
            if (notAuthorized) { // based on something in the event.request
               return {
                 statusCode: 403,
                 statusDescription: 'Unauthorized'
               };
            };
            return event.request;
        }

    You can also add bullet points:

    - you can use dashes or asterisks

    - also, try to indent next line of a point for readability, if it's too
      long to fit in 72 characters
```

* Make sure you have added the necessary tests for your changes.
* Run _all_ the tests to assure nothing else was accidentally broken.
* When you are ready to submit a pull request

### Submitting Changes

* Read the article ["Using Pull Requests"](https://help.github.com/articles/using-pull-requests) on GitHub.
* Make sure your branch is up to date with its parent branch (i.e. main)
  * `git checkout main`
  * `git pull --rebase`
  * `git checkout <your-branch>`
  * `git rebase main`
  * It is a good idea to run your tests again.
* If you've made more than one commit take a moment to consider whether squashing commits together would help improve their logical grouping.
  * [Detailed Walkthrough of One Pull Request per Commit](http://ndlib.github.io/practices/one-commit-per-pull-request/)
  * `git rebase --interactive main` ([See Github help](https://help.github.com/articles/interactive-rebase))
  * Squashing your branch's changes into one commit is "good form" and helps the person merging your request to see everything that is going on.
* Push your changes to a topic branch in your fork of the repository.
* Submit a pull request from your fork to the project.

### Reviewing and Merging Changes

We adopted [Github's Pull Request Review](https://help.github.com/articles/about-pull-request-reviews/) for our repositories.
Common checks that may occur in our repositories:

1. [CircleCI](https://circleci.com/gh/samvera/serverless-iiif) - where our automated tests are running
2. [Coveralls](https://coveralls.io/github/samvera/serverless-iiif) - code coverage reports and checks
3. `eslint` - where we check for style violations
4. Approval Required - Github enforces at least one person approve a pull request. Also, all reviewers that have chimed in must approve.
5. [CodeClimate](https://codeclimate.com/github/samvera/serverless-iiif) - is our code remaining healthy (at least according to static code analysis)

If one or more of the required checks failed (or are incomplete), the code should not be merged (and the UI will not allow it). If all of the checks have passed, then anyone on the project (including the pull request submitter) may merge the code.

*Example: Carolyn submits a pull request, Justin reviews the pull request and approves. However, Justin is still waiting on other checks (CI tests are usually the culprit), so he does not merge the pull request. Eventually, all of the checks pass. At this point, Carolyn or anyone else may merge the pull request.*

#### Things to Consider When Reviewing

First, the person contributing the code is putting themselves out there. Be mindful of what you say in a review.

* Ask clarifying questions
* State your understanding and expectations
* Provide example code or alternate solutions, and explain why

This is your chance for a mentoring moment of another developer. Take time to give an honest and thorough review of what has changed. Things to consider:

  * Does the commit message explain what is going on?
  * Does the code changes have tests? _Not all changes need new tests, some changes are refactorings_
  * Do new or changed methods, modules, and classes have documentation?
  * Does the commit contain more than it should? Are two separate concerns being addressed in one commit?
  * Does the description of the new/changed specs match your understanding of what the spec is doing?
  * Did the Continuous Integration tests complete successfully?

If you are uncertain, bring other contributors into the conversation by assigning them as a reviewer.

# Additional Resources

* [General GitHub documentation](http://help.github.com/)
* [GitHub pull request documentation](https://help.github.com/articles/about-pull-requests/)
* [Pro Git](http://git-scm.com/book) is both a free and excellent book about Git.
* [A Git Config for Contributing](http://ndlib.github.io/practices/my-typical-per-project-git-config/)
