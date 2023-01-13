const shell = require('shelljs');
const repositories = require('./config/repositories.json');
const fs = require('fs');

shell.mkdir('-p', __dirname + '/data');

let results = [];

/*
 * pour chaque dépôt...
 */
for (const [username, repositoryUrl] of Object.entries(repositories)) {
    console.log(`-- ${username} - ${repositoryUrl} ...`);

    let result = {
        username: username,
        repositoryUrl: repositoryUrl
    };

    let repositoryDir = __dirname + '/data/' + username + '/tp-refactoring-graph';

    /*
     * on clone au besoin le dépôt
     */
    if ( ! fs.existsSync(repositoryDir) ){
        let commandClone = `git clone ${repositoryUrl} ${repositoryDir}`;
        shell.exec(commandClone, { silent: true });
    }

    // on se place dans le dossier du dépôt
    shell.cd(repositoryDir);

    /*
     * result.branchName : on récupère le nom de la branche par défaut
     */
    {
        let commandBranchName = 'git symbolic-ref --short HEAD';
        result.branchName = shell.exec(commandBranchName, { silent: true }).stdout.trim();
        console.log('BRANCHE : '+result.branchName);
    }

    /*
     * récupération de la liste des branches
     */
    {
        let commandBranches = `git branch -a > ${repositoryDir}.branches.txt 2>&1`;
        shell.exec(commandBranches);
    }

    /*
     * result.test : on lance la construction
     */
    {
        let commandMvn = `mvn -B clean package -DskipTests > ${repositoryDir}.build.txt 2>&1`;
        result.build = shell.exec(commandMvn).code === 0;
        console.log('BUILD : ' + (result.build ? 'SUCCESS' : 'FAILURE'));
    }

    /*
     * result.test : on lance la construction
     */
    {
        let commandMvn = `mvn -B clean package jacoco:report > ${repositoryDir}.build-test.txt 2>&1`;
        result.test = shell.exec(commandMvn).code === 0;
        console.log('TEST : ' + (result.test ? 'SUCCESS' : 'FAILURE'));
    }

    results.push(result);
}

fs.writeFileSync(
    __dirname + '/results.json',
    JSON.stringify(results, null, 2)
);




