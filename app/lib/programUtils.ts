// Utility to map program id to title
export function programIdToTitle(programs: { id: string; title: string }[], id: string): string {
    const program = programs.find((p) => p.id === id);
    return program ? program.title : id;
}
