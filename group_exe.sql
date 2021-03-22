SELECT modality, notes, research_year, COUNT(_main.id)
FROM _main
INNER JOIN _modality
ON _main.id=_modality.id 
INNER JOIN _research_year
ON _main.id=_research_year.id
GROUP BY modality, notes, research_year