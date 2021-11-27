import * as assert from 'assert';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { workspaceRoot } from '.';
import * as direnv from '../../direnv';

describe('direnv', () => {
	const file = path.join(workspaceRoot, '.envrc');

	afterEach(async () => {
		try {
			await direnv.block(file);
		} catch (_) {
			// ignore errors
		}
	});

	describe('in the test workspace', () => {
		it('finds the .envrc file in the workspace root', async () => {
			const path = await direnv.find();
			assert.strict.equal(path, file);
		});

		it('reuses the .envrc file in the workspace root', async () => {
			const path = await direnv.create();
			assert.strict.equal(path, file);
		});

		it('dumps the allowed .envrc file', async () => {
			await direnv.allow(file);
			const data = await direnv.dump();
			assert.strict.equal(data['VARIABLE'], 'value');
		});

		it('fails to dump the blocked .envrc file', async () => {
			await direnv.allow(file);
			await direnv.block(file);
			try {
				await direnv.dump();
			} catch ({ path }) {
				assert.strict.equal(path, file);
			}
		});
	});

	describe('in a subdirectory workspace', () => {
		const subdir = path.join(workspaceRoot, 'subdir');
		const subfile = path.join(subdir, '.envrc');

		beforeEach(() => {
			sinon.replaceGetter(vscode.workspace, 'workspaceFolders', () => [{ index: 0, name: 'subdir', uri: vscode.Uri.file(subdir) }]);
		});

		it('finds the .envrc file in the parent directory', async () => {
			const path = await direnv.find();
			assert.strict.equal(path, file);
		});

		it('creates an .envrc file in the subdirectory', async () => {
			const path = await direnv.create();
			assert.strict.equal(path, subfile);
		});
	});
});