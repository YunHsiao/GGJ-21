import {
    _decorator, builtinResMgr, gfx, Material,
    SpriteFrame, Texture2D, utils, Vec3, Mesh, ccenum, MeshRenderer, CCBoolean,
} from 'cc';
const { ccclass, property } = _decorator;

let mesh: Mesh | null = null;
let vbInfo: Mesh.IBufferView | null = null;
let vbuffer: ArrayBuffer | null = null;
let material: Material | null = null;

const materialInfo = {
    effectName: 'unlit',
    technique: 0,
    defines: { USE_TEXTURE: true },
    states: { rasterizerState: { cullMode: gfx.CullMode.NONE } },
};
const default_uvs = [
    0, 1,
    1, 1,
    0, 0,
    1, 0,
];
const meshInfo = {
    positions: [
        -0.5, -0.5, 0, // bottom-left
        0.5, -0.5, 0, // bottom-right
        -0.5,  0.5, 0, // top-left
        0.5,  0.5, 0, // top-right
    ],
    uvs: default_uvs,
    indices: [ 0, 1, 2, 2, 1, 3 ],
    minPos: new Vec3(-0.5, -0.5, 0),
    maxPos: new Vec3( 0.5,  0.5, 0),
};
const enableBlend = {
    depthStencilState: { depthWrite: false },
    blendState: { targets: [ {
        blend: true,
        blendSrc: gfx.BlendFactor.SRC_ALPHA,
        blendDst: gfx.BlendFactor.ONE_MINUS_SRC_ALPHA,
        blendDstAlpha: gfx.BlendFactor.ONE_MINUS_SRC_ALPHA,
    } ] },
};
const disableBlend = {
    depthStencilState: { depthWrite: true },
    blendState: { targets: [ {
        blend: false,
    } ] },
};

export enum ResizeAxis {
    NONE,
    X,
    Y
}
ccenum(ResizeAxis);

@ccclass('UnlitQuadComponent')
export class UnlitQuadComponent extends MeshRenderer {

    @property(SpriteFrame)
    public _sprite: SpriteFrame | null = null;

    @property(Texture2D)
    public _texture: Texture2D | null = null;

    @property({ type: Texture2D })
    set texture (val) {
        this._texture = val;
        this.updateTexture();
    }
    get texture () {
        return this._texture;
    }

    @property({ type: SpriteFrame })
    set spriteFrame (val) {
        this._sprite = val;
        this.updateTexture();
    }
    get spriteFrame () {
        return this._sprite;
    }

    @property({ type: CCBoolean })
    set resizeX (val: boolean) {
        this.updateSizeRatio(ResizeAxis.X);
    }
    get resizeX () {
        return false;
    }

    @property({ type: CCBoolean })
    set resizeY (val: boolean) {
        this.updateSizeRatio(ResizeAxis.Y);
    }
    get resizeY () {
        return false;
    }

    @property
    public _transparent = false;

    @property
    set transparent (val: boolean) {
        this._transparent = val;
        this.material!.overridePipelineStates(val ? enableBlend : disableBlend);
    }
    get transparent () {
        return this._transparent;
    }

    public onLoad () {
        if (!material) {
            material = new Material();
            material.initialize(materialInfo);
            mesh = utils.createMesh(meshInfo);
            vbInfo = mesh.struct.vertexBundles[0].view;
            vbuffer = mesh.data.buffer.slice(vbInfo.offset, vbInfo.offset + vbInfo.length);
        }
        this.material = material;
        this._mesh = mesh;
        super.onLoad();
        this.updateTexture();
        this.transparent = this._transparent;
    }

    public updateTexture () {
        // update pass
        const pass = this.material && this.material.passes[0];
        const binding = pass && pass.getBinding('mainTexture');
        if (typeof binding !== 'number') { return; }
        const target = this._sprite ? this._sprite : this._texture ? this._texture : builtinResMgr.get<Texture2D>('grey-texture');
        pass!.bindTexture(binding, target.getGFXTexture());
        // update UV (handle atlas)
        const model = this.model && this.model.subModels[0];
        const ia = model && model.inputAssembler;
        if (!ia) { return; }
        let uv = default_uvs;
        if (this._sprite) { this._sprite._calculateUV(); uv = this._sprite.uv; }

        let offset = 0;
        let format = gfx.Format.UNKNOWN;
        for (const a of ia.attributes) {
            if (a.name === gfx.AttributeName.ATTR_TEX_COORD) { format = a.format; break; }
            offset += gfx.FormatInfos[a.format].size;
        }
        const vb = ia.vertexBuffers[0];
        utils.writeBuffer(new DataView(vbuffer as ArrayBuffer), uv, format, offset, vb.stride);
        vb.update(vbuffer!);
    }

    public updateSizeRatio (axis: ResizeAxis) {
        const target = this._sprite ? this._sprite : this._texture ? this._texture : null;
        const ratio = target ? target.width / target.height : 1;
        const scale = this.node.scale;
        switch (axis) {
            case ResizeAxis.X: this.node.setScale(scale.y * ratio, scale.y, scale.z); break;
            case ResizeAxis.Y: this.node.setScale(scale.x, scale.x / ratio, scale.z); break;
            default: break;
        }
    }

    /////////////////// OVERRIDES ///////////////////

    @property({ override: true, visible: false })
    set sharedMaterials (val) {
        super.sharedMaterials = val;
    }
    get sharedMaterials () {
        return super.sharedMaterials;
    }

    @property({ override: true, visible: false })
    set mesh (val) {
        super.mesh = val;
    }
    get mesh () {
        return super.mesh;
    }

    @property({ override: true, visible: false })
    get shadowCastingMode () {
        return super.shadowCastingMode;
    }
    set shadowCastingMode (val) {
        super.shadowCastingMode = val;
    }

    @property({ override: true, visible: false })
    get receiveShadow () {
        return super.receiveShadow;
    }
    set receiveShadow (val) {
        super.receiveShadow = val;
    }
}
