import { ui, localeFromDocument } from '../data/ui';
import * as progress from './progress';

/**
 * Розмітка, яку оживлює цей скрипт:
 *   [data-lesson-badge="<module>/<lesson>"][data-module="<module>"]  — бейдж статусу уроку
 *   [data-module-bar="<module>"][data-lessons="<k1,k2,...>"]         — смужка прогресу модуля
 *   [data-lesson-controls="<module>/<lesson>"][data-module="<module>"] — кнопки на сторінці уроку
 *   [data-module-skip="<module>"]                                     — форма «вже знаю модуль»
 */

function render() {
	const t = ui[localeFromDocument()];
	const data = progress.load();

	document.querySelectorAll<HTMLElement>('[data-lesson-badge]').forEach((el) => {
		const status = progress.lessonStatus(data, el.dataset.module!, el.dataset.lessonBadge!);
		el.dataset.status = status;
		el.textContent = t.status[status];
	});

	document.querySelectorAll<HTMLElement>('[data-module-bar]').forEach((el) => {
		const moduleId = el.dataset.moduleBar!;
		const keys = (el.dataset.lessons ?? '').split(',').filter(Boolean);
		const finished = keys.filter((k) => {
			const s = progress.lessonStatus(data, moduleId, k);
			return s === 'done' || s === 'known';
		}).length;
		const pct = keys.length ? Math.round((finished / keys.length) * 100) : 0;
		const fill = el.querySelector<HTMLElement>('[data-fill]');
		const label = el.querySelector<HTMLElement>('[data-label]');
		if (fill) fill.style.width = `${pct}%`;
		if (label) label.textContent = t.progressOf(finished, keys.length);
		el.setAttribute('aria-valuenow', String(pct));
	});

	document.querySelectorAll<HTMLElement>('[data-lesson-controls]').forEach((el) => {
		const status = progress.lessonStatus(data, el.dataset.module!, el.dataset.lessonControls!);
		el.querySelectorAll<HTMLButtonElement>('button[data-set]').forEach((b) => {
			b.setAttribute('aria-pressed', String(b.dataset.set === status));
		});
	});

	document.querySelectorAll<HTMLElement>('[data-module-skip]').forEach((el) => {
		const known = data.knownModules.includes(el.dataset.moduleSkip!);
		el.dataset.known = String(known);
		const boxes = [...el.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
		if (known) boxes.forEach((b) => (b.checked = true));
		boxes.forEach((b) => (b.disabled = known));
		updateSkipButton(el);
	});
}

function updateSkipButton(el: HTMLElement) {
	const btn = el.querySelector<HTMLButtonElement>('[data-skip-confirm]');
	if (!btn) return;
	const boxes = [...el.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
	btn.disabled = !boxes.every((b) => b.checked);
}

function wire() {
	document.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;

		const set = target.closest<HTMLButtonElement>('[data-lesson-controls] button[data-set]');
		if (set) {
			const box = set.closest<HTMLElement>('[data-lesson-controls]')!;
			progress.setLesson(box.dataset.lessonControls!, set.dataset.set as progress.LessonStatus);
			return;
		}

		const confirm = target.closest<HTMLButtonElement>('[data-skip-confirm]');
		if (confirm) {
			const box = confirm.closest<HTMLElement>('[data-module-skip]')!;
			progress.setModuleKnown(box.dataset.moduleSkip!, true);
			return;
		}

		const undo = target.closest<HTMLButtonElement>('[data-skip-undo]');
		if (undo) {
			const box = undo.closest<HTMLElement>('[data-module-skip]')!;
			box.querySelectorAll<HTMLInputElement>('input[type=checkbox]').forEach((b) => (b.checked = false));
			progress.setModuleKnown(box.dataset.moduleSkip!, false);
		}
	});

	document.addEventListener('change', (e) => {
		const box = (e.target as HTMLElement).closest<HTMLElement>('[data-module-skip]');
		if (box) updateSkipButton(box);
	});

	progress.onChange(render);
	render();
}

wire();
