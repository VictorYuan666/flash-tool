#!/usr/bin/env node

import { Command } from 'commander';
import pkg from '../package.json';
const shell = require('shelljs');
const figlet = require('figlet');
const chalk = require('chalk');
const boxen = require('boxen');
const updateNotifier = require('update-notifier');
const { prompt } = require('inquirer');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');

const program = new Command();

const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24, // 1 day
});

if (notifier.update) {
  shell.echo(
    chalk.blueBright(
      boxen(`Update available: ${notifier.update.latest}`, { padding: 1 }),
    ),
  );
}

figlet('vee-cli', function (err: any, data: any) {
  shell.echo(chalk.rgb(241, 141, 0).bold(data));

  program
    .version(pkg.version, '-v, --version', '当前vee-cli版本')
    .command('init')
    .alias('i')
    .description('项目初始化')
    .action(async () => {
      const { projectType } = await prompt({
        type: 'list',
        name: 'projectType',
        message: '请选择您要初始化的项目类型',
        choices: ['rn', 'h5', 'admin', 'cli', 'node'],
      });
      console.log(projectType);
      if (projectType === 'rn') {
        const { projectName, appName, bundleId } = await prompt([
          {
            type: 'input',
            name: 'projectName',
            message: '请给你的项目取个名字 例：douyin',
          },
          {
            type: 'input',
            name: 'appName',
            message: '请输入您的应用需要显示的名称 例：抖音',
          },
          {
            type: 'input',
            name: 'bundleId',
            message: '请输入您的应用的包名 例：com.xx.xx',
          },
        ]);
        const spinner = ora('下载模板...');
        spinner.start();
        download('VictorYuan666/rn-template#main', `${projectName}`, function (
          err: any,
        ) {
          if (err) {
            spinner.fail();
            console.log(chalk.red(err));
          } else {
            spinner.succeed();
            shell.cd(projectName);

            shell.rm('-rf', 'CHANGELOG.md');

            shell.sed('-i', 'rn-template', projectName, 'package.json');

            shell.exec('git init && yarn && cd ios && pod install');
            shell.exec(
              `npx react-native-rename "${projectName}" -b ${bundleId}`,
            );

            shell.echo(chalk.green('项目初始化完成'));
          }
        });
      } else {
        shell.echo(chalk.red('敬请期待'));
      }
    });

  program
    .command('generate')
    .alias('g')
    .description('快速生成代码')
    .action(async () => {
      // const gSelect = new Select({
      //   name: 'gType',
      //   message: '选择要生成？',
      //   choices: ['screen', 'component', 'module', 'storybook'],
      // });
      // const type = await gSelect.run();
      // const fileName = path.join(__dirname, `./src/template/${type}.rn.hbs`);
      // const content = fs.readFileSync(fileName).toString();
      // const template = handlebars.compile(content);
      // fs.writeFileSync('Home.js', template({ name: 'Home' }));
      // console.log();
    });
  program.exitOverride();

  try {
    program.parse(process.argv);
  } catch (error) {
    // program.outputHelp();
  }
});
