export default {
  id: 'repository.id',
  totalCount: 'user.repositories.totalCount',
  url: 'repository.url',
  columns: {
    name: 'repository.name',
    description: 'repository.description',
    createdAt: 'repository.createdAt',
    languages: 'repository.languages.nodes',
    languageNames: 'repository.languages.nodes.name',
    isFork: 'repository.isFork',
    defaultBranchRef: 'repository.defaultBranchRef.name'
  }
}
