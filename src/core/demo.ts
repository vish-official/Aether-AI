import { CoreEngine } from './engine';
import { ModuleContext } from './module-loader';
import { ToolManager } from './tool-manager';
import { PermissionManager } from './permission-manager';
import { ToolRunner } from './tool-runner';
import { OpenApplicationTool } from './open-application-tool';

/**
 * Executes a contextual demonstration of the Aether Tool & Permission System.
 */
export async function runToolDemo(engine: CoreEngine): Promise<void> {
  const context: ModuleContext = { logger: engine.getLogger(), eventBus: engine.getEventBus() };

  const toolManager = new ToolManager(context.eventBus, context.logger);
  const permissionManager = new PermissionManager(context.eventBus, context.logger);
  const toolRunner = new ToolRunner(toolManager, permissionManager, context.eventBus, context.logger, context);

  // Register the OpenApplicationTool
  const appTool = new OpenApplicationTool();
  toolManager.register(appTool);

  context.logger.info('BootstrapTest', '=== TOOL SYSTEM & PERMISSION DEMO (SPRINT 5.5) ===');

  // Scenario A: Execute with permission granted (Default state of system.launch_application is GRANTED)
  context.logger.info('BootstrapTest', 'Scenario A: Executing OpenApplicationTool with default granted permissions.');
  const resultA = await toolRunner.execute('open-application', 'calc');
  context.logger.info('BootstrapTest', `Scenario A Result Success: ${resultA.success} | Code: ${resultA.error?.code ?? 'NONE'}`);

  // Scenario B: Revoke permission and attempt execution
  context.logger.info('BootstrapTest', 'Scenario B: Revoking system.launch_application permission and re-executing.');
  permissionManager.revoke('system.launch_application');
  const resultB = await toolRunner.execute('open-application', 'calc');
  context.logger.info('BootstrapTest', `Scenario B Result Success: ${resultB.success} | Code: ${resultB.error?.code ?? 'NONE'} | Reason: ${resultB.error?.message}`);

  // Scenario C: Re-grant permission and execute again
  context.logger.info('BootstrapTest', 'Scenario C: Re-granting permission and re-executing.');
  permissionManager.grant('system.launch_application');
  const resultC = await toolRunner.execute('open-application', 'calc');
  context.logger.info('BootstrapTest', `Scenario C Result Success: ${resultC.success} | Code: ${resultC.error?.code ?? 'NONE'}`);

  context.logger.info('BootstrapTest', '=== DEMO COMPLETE ===');
}
