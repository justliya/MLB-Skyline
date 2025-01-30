# TODO put all prompts in this file

PITCH_PREDICTION_PROMPT = """
    Based on this guideline - 
    + - following pickoff throw by the catcher
    * - indicates the following pitch was blocked by the catcher 
    . - marker for play not involving the batter 
    1 - pickoff throw to first 
    2 - pickoff throw to second 
    3 - pickoff throw to third 
    >  -Indicates a runner going on the pitch

    A - automatic strike, usually for pitch timer violation
    B - ball
    C - called strike
    F - foul
    H - hit batter
    I - intentional ball
    K - strike (unknown type)
    L - foul bunt
    M - missed bunt attempt
    N - no pitch (on balks and interference calls)
    O - foul tip on bunt
    P - pitchout
    Q - swinging on pitchout
    R - foul ball on pitchout
    S - swinging strike
    T - foul tip
    U - unknown or missed pitch
    V - called ball because pitcher went to his mouth or automatic ball on intentional walk or
    pitch timer violation
    X - ball put into play by batter
    Y - ball put into play on pitchout
    What does {} pitch translate to in baseball? Explain in 3 words
"""
