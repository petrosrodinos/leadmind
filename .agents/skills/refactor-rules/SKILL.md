Do not implement backward compatibility with legacy structures, deprecated fields, or previous workflows unless explicitly required. Assume this is a greenfield or active development environment with no production constraints, migrations, or real user data.

Prioritize:

- clean architecture
- readability
- maintainability
- modular and reusable code
- clear naming conventions
- scalability for future features
- predictable and explicit flows

Avoid:

- temporary patches
- defensive legacy abstractions
- unnecessary complexity introduced only for compatibility
- overengineering for hypothetical edge cases

Focus on designing the system correctly from the start, even if that means simplifying or replacing old patterns entirely.
