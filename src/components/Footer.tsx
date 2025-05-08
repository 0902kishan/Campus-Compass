export function Footer() {
  return (
    <footer className="border-t py-8 bg-secondary/50">
      <div className="container text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Campus Compass. All rights reserved.</p>
        <p>Helping connect lost items with their owners.</p>
      </div>
    </footer>
  );
}
