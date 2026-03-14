import { Command } from 'commander';
import { icons, c, log, logJson, logError, withSpinner, getCurrentMode } from '../lib/output.js';
import { loadConfig } from '../lib/config.js';
import { createApiClient, ApiClientError } from '../lib/api-client.js';

export const registerCollaboratorsCommand = (program: Command): void => {
  const cmd = program.command('collaborators <skill>').description('Manage skill collaborators');

  cmd
    .command('list')
    .description('List collaborators for a skill')
    .action(async () => {
      const skillName = cmd.args[0];
      const mode = getCurrentMode();
      const config = loadConfig();
      const api = createApiClient(config);

      try {
        const data = await withSpinner(`Fetching collaborators for ${skillName}...`, () =>
          api.listCollaborators(skillName),
        );

        if (mode === 'json') {
          logJson(data);
          return;
        }

        if (data.collaborators.length === 0) {
          log(`${icons.info} No collaborators found for ${c.name(skillName)}`);
          return;
        }

        log(`\n  ${c.name(skillName)} collaborators:\n`);
        for (const collab of data.collaborators) {
          const roleTag = collab.role === 'owner' ? c.trust(' (owner)') : '';
          log(
            `  ${icons.bullet} ${c.name(collab.username)}${roleTag}  ${c.dim(collab.trust_tier)}`,
          );
        }
        log('');
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          logError('Skill not found', `${skillName} does not exist in the registry.`);
        } else {
          logError('Failed', err instanceof Error ? err.message : String(err));
        }
        process.exitCode = 1;
      }
    });

  cmd
    .command('add <username>')
    .description('Add a collaborator to a skill')
    .action(async (username: string) => {
      const skillName = cmd.args[0];
      const mode = getCurrentMode();
      const config = loadConfig();

      if (!config.token) {
        logError('Not authenticated', 'Run `spm login` to authenticate.');
        process.exitCode = 1;
        return;
      }

      const api = createApiClient(config);

      try {
        const result = await withSpinner(`Adding ${username} to ${skillName}...`, () =>
          api.addCollaborator(skillName, username),
        );

        log(`${icons.success} Added ${c.name(username)} as collaborator on ${c.name(skillName)}`);

        if (mode === 'json') {
          logJson(result);
        }
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.status === 404) {
            logError('Not found', err.apiError.message);
          } else if (err.status === 403) {
            logError('Permission denied', 'Only the skill owner can manage collaborators.');
          } else if (err.status === 409) {
            logError(
              'Already a collaborator',
              `${username} is already a collaborator on ${skillName}.`,
            );
          } else {
            logError('Failed', err.apiError.message);
          }
        } else {
          logError('Failed', err instanceof Error ? err.message : String(err));
        }
        process.exitCode = 1;
      }
    });

  cmd
    .command('remove <username>')
    .description('Remove a collaborator from a skill')
    .action(async (username: string) => {
      const skillName = cmd.args[0];
      const mode = getCurrentMode();
      const config = loadConfig();

      if (!config.token) {
        logError('Not authenticated', 'Run `spm login` to authenticate.');
        process.exitCode = 1;
        return;
      }

      const api = createApiClient(config);

      try {
        const result = await withSpinner(`Removing ${username} from ${skillName}...`, () =>
          api.removeCollaborator(skillName, username),
        );

        log(`${icons.success} Removed ${c.name(username)} from ${c.name(skillName)}`);

        if (mode === 'json') {
          logJson(result);
        }
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.status === 404) {
            logError('Not found', err.apiError.message);
          } else if (err.status === 403) {
            logError('Permission denied', err.apiError.message);
          } else {
            logError('Failed', err.apiError.message);
          }
        } else {
          logError('Failed', err instanceof Error ? err.message : String(err));
        }
        process.exitCode = 1;
      }
    });
};
