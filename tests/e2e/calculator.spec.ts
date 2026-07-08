import { test, expect } from '@playwright/test';

test('Calculadora carrega e exibe painel', async ({ page }) => {
  await page.goto('/calculator');
  
  // Verifica se o painel de personagem carregou
  await expect(page.getByText('Status do Personagem')).toBeVisible();
  
  // Verifica se os slots de equipamento existem
  await expect(page.getByText('Equipamentos e Cartas')).toBeVisible();
});

test('Selecionar uma classe muda os status', async ({ page }) => {
  await page.goto('/calculator');
  
  // Abre o combobox de classes
  await page.getByRole('combobox').click();
  // Digita Cavaleiro Rúnico
  await page.getByPlaceholder('Buscar classe...').fill('Cavaleiro Rúnico');
  // Seleciona a opção
  await page.getByRole('option', { name: 'Cavaleiro Rúnico' }).click();

  // Verifica se o Max HP renderizou após a troca
  await expect(page.getByText('Max HP')).toBeVisible();
});
