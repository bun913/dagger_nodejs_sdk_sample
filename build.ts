import Client, { connect } from "@dagger.io/dagger";

// initialize Dagger client
connect(async (client: Client) => {
  // get reference to the local project
  const source = client.host().directory(".", { exclude: ["node_modules/"] });

  // get Node image
  const node = client.container().from("node:16");

  // mount cloned repository into Node image
  const runner = client
    .container({ id: node })
    .withMountedDirectory("/src", source)
    .withWorkdir("/src")
    .withExec(["npm", "install"]);

  // run tests
  await runner.withExec(["npm", "test", "--", "--watchAll=false"]).exitCode();

  // build application
  // write the build output to the host
  const build = await runner.withExec(["npm", "run", "build"]);
  // 先に出力結果の表示
  // 結果確認のためlsコマンドを追加
  const lsResult = await build.withExec(["ls", "./build"]).stdout();
  console.log(lsResult);
  // buildした結果をホストに出力
  await build.directory("build/").export("./build");
});
