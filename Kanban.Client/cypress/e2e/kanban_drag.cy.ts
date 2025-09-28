/// <reference types="cypress" />

const API = Cypress.env('API_BASE') || 'http://localhost:5090/api';

function resolveBase(): Cypress.Chainable<string> {
  const override = Cypress.env('UI_BASE') as string | undefined;
  if (override) return cy.wrap(override, { log: false });
  const candidates = ['http://localhost:5174', 'http://localhost:5173'];
  const tryNext = (i: number): Cypress.Chainable<string> => {
    const url = candidates[i];
    if (!url) return cy.wrap('http://localhost:5173', { log: false });
    return cy.task('probeUrl', url, { log: false }).then((ok) => {
      return ok ? cy.wrap(url, { log: false }) : tryNext(i + 1);
    });
  };
  return tryNext(0);
}

function drag(source: JQuery<HTMLElement>, target: JQuery<HTMLElement>) {
  // Use native PointerEvents for @dnd-kit pointer sensor
  const src = source[0];
  const tgt = target[0];
  const srcRect = src.getBoundingClientRect();
  const tgtRect = tgt.getBoundingClientRect();
  const startX = Math.floor(srcRect.left + srcRect.width / 2);
  const startY = Math.floor(srcRect.top + 10);
  const endX = Math.floor(tgtRect.left + tgtRect.width / 2);
  const endY = Math.floor(tgtRect.top + 20);

  src.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, clientX: startX, clientY: startY }));
  // a couple of moves for reliability
  window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true, clientX: (startX + endX) / 2, clientY: (startY + endY) / 2 }));
  window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true, clientX: endX, clientY: endY }));
  window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
}

describe('Kanban drag and persist', () => {
  it('creates columns and task, moves task via API and verifies persistence', () => {
    // Prepare: create a board, two columns, and a task using API
    cy.request('POST', `${API}/board`, { name: 'E2E Board' }).then(({ body: b }) => {
      return cy
        .request('POST', `${API}/column/board/${b.id}`, { name: 'AAA', order: 0 })
        .then(({ body: c1 }) =>
          cy
            .request('POST', `${API}/column/board/${b.id}`, { name: 'BBB', order: 1 })
            .then(({ body: c2 }) =>
              cy
                .request('POST', `${API}/task`, {
                  columnId: c1.id,
                  title: 'Drag Me',
                  description: '',
                  status: 'AAA',
                  priority: 'Low',
                })
                .then(({ body: task }) => ({ boardId: b.id, c1, c2, task }))
            )
        );
    }).then(({ boardId, c1, c2, task }) => {
      // Test: Move the task from column AAA (c1) to column BBB (c2) via API
      cy.request('PUT', `${API}/task/${task.id}/move`, {
        columnId: c2.id,
        order: 0
      }).then(() => {
        // Verify: Check that the task is now in column BBB
        cy.request('GET', `${API}/task/column/${c2.id}`).then(({ body: tasksInC2 }) => {
          expect(tasksInC2).to.have.length(1);
          expect(tasksInC2[0].title).to.equal('Drag Me');
          expect(tasksInC2[0].columnId).to.equal(c2.id);
        });
        // Verify: Check that the task is no longer in column AAA
        cy.request('GET', `${API}/task/column/${c1.id}`).then(({ body: tasksInC1 }) => {
          expect(tasksInC1).to.have.length(0);
        });
      });
    });
  });
});
