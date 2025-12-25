# Product zoeker

Een website dat kan helpen bij het zoeken van product informatie op basis van een product nummer of een barcode. De informatie waardoor gezocht wordt moet worden aangeleverd door de gebruiker. Dit werkt via een csv-bestand waarbij de eerste kolom het product nummer omvat waar op gezocht wordt. De overige kolommen bevatten relevante product informatie.

In de praktijk zijn er winkels zonder een geavanceerd digitaal systeem. Wanneer er prijs wijzigingen moeten worden doorgevoerd, dan gebeurt dit met de hand. Dit is te overzien wanneer je winkel een gering aantal producten heeft, maar wordt al snel ingewikkeld wanneer er misschien wel honderden verschillende producten zijn. 

Deze project en bijbehorende website kan bijspringen in dit proces! De prijswijzigingen worden vaak in gestructureerde data doorgegeven, zoals een excel. Het is eenvoudig om daarvan een CSV te maken. Vervolgens kan je het csv-bestand inladen op de website. Daarna kan je het csv-bestand eenvoudig doorzoeken op de eerste kolom, waarbij alle (extra) kolommen worden weergeven in de zoekresultaten. Er is ondersteuning voor de [Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API), waardoor je scannend door de winkel kan lopen om de prijzen bij te werken.

https://github.com/user-attachments/assets/4b726028-c9c0-4bff-adbb-59fa5ad4c7f4

## Formaat van een CSV bestand

De eerste kolom van een csv-bestand moet het product nummer bevatten. De tweede kolom komt terug in de zoekresultaten, het is handig als daar de naam staat. De overige kolommen komen terug wanneer er een enkel zoek resultaat is.

Als voorbeeld van hoe een csv-bestand eruit zou kunnen zien:

| Product Code | Name                         | Price   | Reduced Price |
|--------------|------------------------------|---------|---------------|
| 12345678     | Premium Coffee Maker         | €129.99 | 15%           |
| 23456789     | Wireless Headphones          | €89.95  | 25%           |
| 34567890     | Smart Watch                  | €249.50 | 10%           |
| 45678901     | Portable Blender             | €59.99  | 30%           |
| 56789012     | Yoga Mat                     | €29.95  | 20%           |
| 67890123     | Stainless Steel Water Bottle | €19.99  | 15%           |
| 78901234     | Organic Cotton Blanket       | €79.95  | 40%           |
| 89012345     | LED Desk Lamp                | €45.50  | 20%           |

Je kan eenvoudig een csv-bestand maken vanuit een bestaand Excel bestand:

- Maak een nieuw sheet aan.
- Kopieer de productnummers naar de eerste kolom.
- Kopieer gegevens interessant voor tijdens het zoeken naar de tweede kolom.
- Kopieer de rest van de gegevens naar de overige kolommen.

Vervolgens kan je het csv-bestand aanmaken door naar _Bestand -> Exporteren -> Aanpassen bestands type -> CSV_ te gaan. Dit csv-bestand kan dan worden geladen, waarna je het eenvoudig doorzoeken op de werkvloer.

## Ontwikkelen

Om de applicatie lokaal te starten, voer de volgende opdracht uit:

```bash
ng serve
```

Zie ook [package.json](../package.json) voor meer informatie.
